package com.skillpilot.backend.content;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.repository.LearnerRepository;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.web.server.ResponseStatusException;

/** Separate state: imports of curriculum, client state or mastery cannot overwrite it. */
@Service
public class ContentSelectionService {
    public record Selection(long revision, Set<String> selectedPackageIds) {}
    private final JdbcTemplate jdbc;
    private final LearnerRepository learners;
    private final ContentCatalog catalog;
    private final ContentAvailability availability;
    private final ObjectMapper mapper;

    public ContentSelectionService(JdbcTemplate jdbc, LearnerRepository learners, ContentCatalog catalog,
            ContentAvailability availability, ObjectMapper mapper) {
        this.jdbc = jdbc;
        this.learners = learners;
        this.catalog = catalog;
        this.availability = availability;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public Selection selection(String learnerId) {
        var rows = jdbc.query("SELECT revision, package_ids FROM learner_content_selection WHERE learner_id = ?",
                (rs, row) -> new Selection(rs.getLong(1), decode(rs.getString(2))), learnerId);
        return rows.isEmpty() ? new Selection(0, Set.of()) : rows.getFirst();
    }

    // The coach calls this while its own read/write transaction is active. An optional
    // SQL failure must not abort that transaction (including PostgreSQL's aborted-SQL
    // state), so catching the exception in the resolver alone would be insufficient.
    // Only this optional lookup is isolated; configuration writes keep the learner lock.
    @Transactional(readOnly = true, propagation = Propagation.REQUIRES_NEW, timeout = 2)
    public Set<String> selectedPackageIds(String learnerId) {
        if (!availability.isEnabled()) return Set.of();
        return selection(learnerId).selectedPackageIds();
    }

    @Transactional
    public Selection update(String learnerId, long expectedRevision, List<String> packageIds) {
        availability.requireEnabled();
        if (expectedRevision < 0 || packageIds == null || packageIds.size() > 20
                || packageIds.stream().anyMatch(id -> id == null || !catalog.hasActivePackage(id))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown or unavailable content package");
        }
        // Shared lock serializes this configuration with coach writes and profile deletion.
        var learner = learners.findBySkillpilotIdForUpdate(learnerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Learner not found"));
        Selection previous = selection(learnerId);
        if (previous.revision() != expectedRevision) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Content selection changed; reload before saving");
        }
        Set<String> selected = new TreeSet<>(packageIds);
        if (selected.equals(previous.selectedPackageIds())) return previous;
        long revision = Math.addExact(previous.revision(), 1);
        String encoded;
        try { encoded = mapper.writeValueAsString(selected); }
        catch (Exception impossible) { throw new IllegalStateException(impossible); }
        int updated = jdbc.update("UPDATE learner_content_selection SET revision = ?, package_ids = ? WHERE learner_id = ?",
                revision, encoded, learnerId);
        if (updated == 0) jdbc.update(
                "INSERT INTO learner_content_selection (learner_id, revision, package_ids) VALUES (?, ?, ?)",
                learnerId, revision, encoded);
        learner.setCoachStateRevision(Math.addExact(learner.getCoachStateRevision(), 1));
        learners.save(learner);
        return new Selection(revision, Set.copyOf(selected));
    }

    private Set<String> decode(String value) {
        try {
            var values = mapper.readValue(value, new TypeReference<List<String>>() {});
            return Set.copyOf(values);
        } catch (Exception invalidStoredSelection) {
            // Malformed optional data is never a prerequisite to learning.
            return Set.of();
        }
    }
}
