from datetime import datetime, timedelta
from nose.tools import assert_raises, assert_equal, assert_not_equal, assert_true
from tests.base import BaseTestCase
from sqlalchemy.orm.exc import NoResultFound
import splice
from splice.queries import get_scheduled_distributions, unschedule_distribution, insert_distribution

class ScheduleTest(BaseTestCase):
    def insert_distro(self, dt=None):
        if dt is None:
            dt = datetime.utcnow() + timedelta(hours=5)
        elif dt == -1:
            dt = None
        insert_distribution('http://some_url', 1, False, dt)
        return dt


class TestGetSchedule(ScheduleTest):

    def test_range(self):
        scheduled_dt = self.insert_distro()

        # found when queried at exactly the same time
        dists = get_scheduled_distributions(1, scheduled_dt)
        assert_equal(1, len(dists))

        # found within 2 minutes of scheduled time + 1 minute
        dists = get_scheduled_distributions(2, scheduled_dt + timedelta(minutes=1))
        assert_equal(1, len(dists))

        # not found when query is after scheduled time
        dists = get_scheduled_distributions(1, scheduled_dt - timedelta(seconds=30))
        assert_equal(0, len(dists))

        # larger range check
        base_dt = datetime(2015, 1, 1, 0, 0)
        schedule_dt = base_dt - timedelta(minutes=5)
        self.insert_distro(schedule_dt)

        # ran looking for distributions from 23:50 up until 00:05
        dists = get_scheduled_distributions(15, base_dt + timedelta(minutes=5))
        assert_equal(1, len(dists))

    def test_get_present(self):
        dt = self.insert_distro(datetime.utcnow())
        dists = get_scheduled_distributions(1)
        assert_equal(1, len(dists))

    def test_invalid_minutes(self):
        with assert_raises(ValueError) as e:
            get_scheduled_distributions(0)

        with assert_raises(ValueError) as e:
            get_scheduled_distributions(-1)

        with assert_raises(ValueError) as e:
            get_scheduled_distributions(None)


class TestUnscheduling(ScheduleTest):

    def test_unschedule(self):
        dt = self.insert_distro()
        dist = get_scheduled_distributions(1, dt)[0]
        unschedule_distribution(dist.id)
        dists = get_scheduled_distributions(1, dt)
        assert_equal(0, len(dists))

    def test_unschedule_inexistent(self):
        with assert_raises(NoResultFound):
            unschedule_distribution(5)
