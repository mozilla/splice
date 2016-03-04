from nose.tools import assert_equal
from tests.base import BaseTestCase
from splice.bucketer.domain_map import DomainMap
import json


class TestDomainMap(BaseTestCase):

    def setUp(self):
        self.domainMap = DomainMap()

    def test_domain_map(self):
        """
        /__domainmap__  test domain mappings
        """
        # assert that inserted domains get proper IDs
        assert_equal(self.domainMap.getDomainID("foo.com", True), 1)
        assert_equal(self.domainMap.getDomainID("bar.com", True), 2)
        # IDs must be sticky
        assert_equal(self.domainMap.getDomainID("foo.com", True), 1)
        assert_equal(self.domainMap.getDomainID("bar.com", True), 2)

        # add related sites and assert thier IDs
        self.domainMap.addRelatedSite("foo.com", "tag", "foo1.com", 0.25)
        self.domainMap.addRelatedSite("foo.com", "tag", "foo2.com", 0.25)
        self.domainMap.addRelatedSite("foo.com", "tag", "bar.com", 0.25)

        self.domainMap.addRelatedSite("bar.com", "tag", "bar1.com", 0.5)
        self.domainMap.addRelatedSite("bar.com", "tag", "bar2.com", 0.5)
        self.domainMap.addRelatedSite("bar.com", "tag", "foo.com")

        # since we added 6 sites, IDCount should be 6
        assert_equal(self.domainMap.getIDCount(), 6)
        assert_equal(json.dumps(self.domainMap.domains["foo.com"]["tags"]["tag"]),
                     json.dumps([[3, 0.25], [4, 0.25], [2, 0.25]]))

        # test model sites
        self.domainMap.addModelSite(1, 1, 1)
        self.domainMap.addModelSite(2, 2, 2)
        print self.domainMap.getModelUsers()
        assert_equal(json.dumps(self.domainMap.getModelUsers()), json.dumps([1, 2]))
        assert_equal(json.dumps(self.domainMap.getModelRanks()), json.dumps([2, 3]))
