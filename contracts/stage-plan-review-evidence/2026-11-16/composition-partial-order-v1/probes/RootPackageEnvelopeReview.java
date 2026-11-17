package com.skillpilot.backend.curriculumpackage;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.file.*;
import java.util.*;

public class RootPackageEnvelopeReview {
  static final ObjectMapper mapper = new ObjectMapper();
  static final String schema = "https://skillpilot.com/schemas/curriculum-package/v1.3/runtime-composition-view.schema.json";
  static Map<String,Object> group(String id, Object child) {
    return Map.of("kind","structure","id",id,"label",id,"children",List.of(child));
  }
  static void require(boolean value, String message) { if (!value) throw new AssertionError(message); }
  public static void main(String[] args) throws Exception {
    var base = CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha",'a');
    var spec = new CurriculumPackageTestFixture.PackageSpec(base.suffix(),base.packageId(),base.landscapeId(),
      base.hashCharacter(),base.closureHashCharacter(),base.indexHashCharacter(),base.definitionKey(),
      base.definitionOwner(),base.definitionDigest(),base.moduleLandscapeId(),true,base.externalUrlScheme());
    var store = new CurriculumPackageTestFixture(mapper).create(Path.of(args[0]).resolve("store"),spec);
    var properties = new CurriculumPackageProperties();
    properties.setSource(CurriculumSourceMode.PACKAGE);properties.setConsumerVersion("0.1.0");
    properties.getPackages().setStoreDirectory(store.root().toString());
    var reader = new CurriculumPackageFileReader();
    var repository = new FileSystemCurriculumPackageRepository(properties,mapper,reader);
    var snapshot = new JsonCurriculumPackageLoader(properties,repository,reader,mapper).load();
    int positives=0,negatives=0;
    for (boolean reverse : List.of(false,true)) for (int mutation=0;mutation<8;mutation++) {
      var views = new LinkedHashMap<String,CurriculumRuntimeSnapshot.ViewDescriptor>();
      int index=0;
      for (var original:snapshot.viewsById().values()) {
        boolean marked=(index++==0)==reverse;
        var atom = new LinkedHashMap<String,Object>();
        atom.put("kind","goalEntry");atom.put("goalId","unmapped-goal-alpha");atom.put("projectionRole","prerequisiteOnly");
        if(marked)atom.put("acquisitionPlacement",true);
        var parent = new LinkedHashMap<String,Object>();parent.put("kind","structure");parent.put("id","program");parent.put("label","Program");
        parent.put("children",List.of(group(marked?"proper-place":"old-reference",atom),
          group("application",Map.of("kind","goalEntry","goalId","goal-alpha"))));
        parent.put("childOrder",Map.of("after",marked?List.of(Map.of("unit","application","after","proper-place")):List.of()));
        var doc = new LinkedHashMap<String,Object>();doc.put("$schema",schema);doc.put("viewFormatVersion","1.2");
        doc.put("language",original.language());doc.put("viewId",original.viewId());doc.put("landscapeId",original.landscapeId());
        doc.put("scope",original.scope());doc.put("rootNodes",List.of(parent));
        if(marked) switch(mutation) {
          case 1 -> doc.put("$schema","https://skillpilot.com/schemas/composition-view/v1.2/composition-view.schema.json");
          case 2 -> doc.put("viewFormatVersion","1.0");
          case 3 -> doc.put("viewFormatVersion","1.7");
          case 4 -> doc.put("language","en");
          case 5 -> doc.remove("language");
          case 6 -> doc.put("language",42);
          case 7 -> parent.put("childOrder",Map.of("after",List.of(Map.of("unit","application","after","absent"))));
          default -> {}
        }
        views.put(original.viewId(),new CurriculumRuntimeSnapshot.ViewDescriptor(original.packageId(),original.viewId(),
          original.landscapeId(),original.language(),original.scope(),original.artifact(),mapper.writeValueAsString(doc)));
      }
      var input = new CurriculumRuntimeSnapshot(snapshot.generationSha256(),snapshot.packages(),snapshot.rootLandscapeIds(),
        snapshot.landscapesById(),views,snapshot.offeringsById(),snapshot.decksByKey(),snapshot.resourcesById(),
        snapshot.resourcesByPublicUrl(),snapshot.artifactsByKey(),snapshot.migrationAliasesJsonByPackageId(),snapshot.definitionCount());
      try {
        var state=PackageCompositionViewState.load(input,mapper);
        require(mutation==0,"invalid envelope/order accepted: "+mutation);
        var offering=state.resolveOffering("offering-alpha");
        for(var actual:List.of(offering.document(),state.findViewDocumentById(offering.runtimeViewId()))) {
          require(schema.equals(actual.get("$schema")),"runtime schema lost");require("1.2".equals(actual.get("viewFormatVersion")),"format lost");
          require("de-DE".equals(actual.get("language")),"language lost");
          var tree=mapper.valueToTree(actual);var program=tree.path("rootNodes").get(0);
          require(program.path("childOrder").path("after").get(0).path("after").asText().equals("proper-place"),"after lost");
          require(program.path("children").findValues("acquisitionPlacement").size()==1,"acquisition marker duplicated");
          var children=program.path("children");
          boolean proper=false;
          for(var child:children) if(child.path("id").asText().equals("proper-place"))proper=child.path("children").get(0).path("acquisitionPlacement").asBoolean();
          require(proper,"marker moved to old reference");
          try { actual.put("language","poison");throw new AssertionError("mutable returned document"); }
          catch(UnsupportedOperationException expected) {}
        }
        positives++;
      } catch(CurriculumPackageException expected) {
        if(mutation==0)throw expected;negatives++;
      }
    }
    System.out.println("PASS: "+positives+" actual package offering/lookup cases; "+negatives+" negative cases; declared order, local marker, immutable runtime envelope.");
  }
}
