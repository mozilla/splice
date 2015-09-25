from datetime import datetime, timedelta
from nose.tools import assert_raises, assert_equal
from tests.base import BaseTestCase
from sqlalchemy.orm.exc import NoResultFound
from splice.queries.common import (
    get_scheduled_distributions,
    unschedule_distribution,
    insert_distribution,
    get_upcoming_distributions)


class ScheduleTest(BaseTestCase):
    def insert_distro(self, channel_id=1, deployed=False, dt=None):
        if dt is None:
            dt = datetime.utcnow() + timedelta(hours=5)
        elif dt == -1:
            dt = None
        insert_distribution('http://some_url', channel_id, deployed, dt)
        return dt


class TestGetSchedule(ScheduleTest):

    def test_range(self):
        """
        Test scheduling range
        """
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
        self.insert_distro(dt=schedule_dt)

        # ran looking for distributions from 23:50 up until 00:05
        dists = get_scheduled_distributions(15, base_dt + timedelta(minutes=5))
        assert_equal(1, len(dists))

    def test_get_present(self):
        """
        Test scheduled within 1 minute
        """
        self.insert_distro(dt=datetime.utcnow())
        dists = get_scheduled_distributions(1)
        assert_equal(1, len(dists))

    def test_invalid_minutes(self):
        """
        Test scheduled invalid
        """
        with assert_raises(ValueError):
            get_scheduled_distributions(0)

        with assert_raises(ValueError):
            get_scheduled_distributions(-1)

        with assert_raises(ValueError):
            get_scheduled_distributions(None)


class TestUpcomingDistributions(ScheduleTest):

    def test_upcoming_limits(self):
        """
        Test limits
        """
        distro_times = [self.insert_distro() for i in range(5)]

        dists = get_upcoming_distributions()
        assert_equal(5, len(dists[1]))

        dists = get_upcoming_distributions(limit=1)
        assert_equal(1, len(dists[1]))
        assert_equal(distro_times[0], dists[1][0]['scheduled_at'])

    def test_upcoming_empty(self):
        """
        Test when there is nothing to return
        """
        dists = get_upcoming_distributions()
        assert_equal({}, dists)

    def test_upcoming_leniency(self):
        """
        Tests fetching a distribution from the recent past using leniency
        """
        schedule = datetime.utcnow() - timedelta(minutes=14)
        self.insert_distro(dt=schedule)

        # within leniency bounds
        dists = get_upcoming_distributions(leniency_minutes=15)
        assert_equal(1, len(dists[1]))
        assert_equal(schedule, dists[1][0]['scheduled_at'])

        # just outside of leniency bounds
        dists = get_upcoming_distributions(leniency_minutes=14)
        assert_equal({}, dists)

        # test multiple dists
        self.insert_distro()
        dists = get_upcoming_distributions(leniency_minutes=15)
        assert_equal(2, len(dists[1]))
        dists = get_upcoming_distributions(leniency_minutes=14)
        assert_equal(1, len(dists[1]))

        # leniency overriden if include_past is given
        dists = get_upcoming_distributions(leniency_minutes=1, include_past=True)
        assert_equal(2, len(dists[1]))

    def test_channels(self):
        """
        Test results with multiple channels
        """
        schedule = datetime.utcnow() - timedelta(minutes=14)

        dist_scheds = {
            1: self.insert_distro(channel_id=1, dt=schedule),
            2: self.insert_distro(channel_id=2)
        }

        dists = get_upcoming_distributions(leniency_minutes=15)
        assert_equal(2, len(dists.keys()))
        for dist_id, c_dists in dists.iteritems():
            assert_equal(1, len(c_dists))
            assert_equal(dist_scheds[dist_id], c_dists[0]['scheduled_at'])


class TestUnscheduling(ScheduleTest):

    def test_unschedule(self):
        """
        Simple Unschedule
        """
        dt = self.insert_distro()
        dist = get_scheduled_distributions(1, dt)[0]
        unschedule_distribution(dist.id)
        dists = get_scheduled_distributions(1, dt)
        assert_equal(0, len(dists))

    def test_unschedule_inexistent(self):
        "Unschedule something that doesn't exist"
        with assert_raises(NoResultFound):
            unschedule_distribution(5)
