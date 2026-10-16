import subprocess
import unittest
from unittest.mock import Mock

import postgres_service as service


def result(code=0, stdout="", stderr=""):
    return subprocess.CompletedProcess([], code, stdout, stderr)


class PostgresServiceTest(unittest.TestCase):
    def test_same_digest_fallback_waits_for_health_and_checks_major_version(self):
        run = Mock(side_effect=[result(1), result(), result(), result(stdout="starting"),
                                result(stdout="healthy"), result(stdout="150018\n")])
        sleep = Mock()
        service.start("skillpilot_revoke_test", run=run, sleep=sleep)
        calls = [c.args[0] for c in run.call_args_list]
        self.assertEqual(calls[:2], [["docker", "pull", image] for image in service.IMAGES])
        self.assertTrue(all(image.endswith("@" + service.DIGEST) for image in service.IMAGES))
        self.assertEqual(calls[2][-1], service.IMAGES[1])
        self.assertIn("--pull=never", calls[2])
        self.assertIn("127.0.0.1:5432:5432", calls[2])
        self.assertIn("POSTGRES_DB=skillpilot_revoke_test", calls[2])
        self.assertEqual(calls[-1][-1], "SHOW server_version_num")
        sleep.assert_called_once_with(2)

    def test_first_registry_success_does_not_pull_the_second(self):
        run = Mock(side_effect=[result(), result(), result(stdout="healthy"), result(stdout="150018")])
        service.start("skillpilot_oauth_test", run=run)
        pulls = [c.args[0] for c in run.call_args_list if c.args[0][1] == "pull"]
        self.assertEqual(pulls, [["docker", "pull", service.IMAGES[0]]])

    def test_both_registry_failures_never_start_or_claim_a_database(self):
        run = Mock(return_value=result(1))
        with self.assertRaisesRegex(RuntimeError, "Neither official registry"):
            service.start("skillpilot_revoke_test", run=run)
        self.assertEqual(run.call_count, 2)

    def test_pull_timeout_can_use_the_same_digest_from_second_registry(self):
        run = Mock(side_effect=[subprocess.TimeoutExpired(["docker", "pull"], 180), result(),
                                result(), result(stdout="healthy"), result(stdout="150018")])
        service.start("skillpilot_revoke_test", run=run)
        self.assertEqual(run.call_args_list[2].args[0][-1], service.IMAGES[1])

    def test_unhealthy_database_fails_before_version_or_tests(self):
        run = Mock(side_effect=[result(), result(), result(stdout="unhealthy"), result()])
        with self.assertRaisesRegex(RuntimeError, "did not become healthy"):
            service.start("skillpilot_revoke_test", run=run)
        self.assertEqual(run.call_args_list[-1].args[0], ["docker", "logs", service.CONTAINER])

    def test_readiness_timeout_is_bounded_and_fails(self):
        run = Mock(side_effect=[result(), result()] + [result(stdout="starting")] * 60 + [result()])
        sleep = Mock()
        with self.assertRaisesRegex(RuntimeError, "did not become healthy"):
            service.start("skillpilot_revoke_test", run=run, sleep=sleep)
        self.assertEqual(sleep.call_count, 59)

    def test_wrong_postgres_major_is_not_a_pass(self):
        run = Mock(side_effect=[result(), result(), result(stdout="healthy"), result(stdout="160004")])
        with self.assertRaisesRegex(RuntimeError, "Expected PostgreSQL 15"):
            service.start("skillpilot_oauth_test", run=run)

    def test_invalid_database_never_reaches_docker(self):
        run = Mock()
        with self.assertRaises(ValueError):
            service.start("test; exit 0", run=run)
        run.assert_not_called()

    def test_cleanup_allows_absent_container_but_reports_other_failures(self):
        service.stop(run=Mock(return_value=result(1, stderr="No such container: test")))
        with self.assertRaisesRegex(RuntimeError, "Could not remove"):
            service.stop(run=Mock(return_value=result(1, stderr="Docker daemon unavailable")))


if __name__ == "__main__":
    unittest.main()
