import time
from datetime import datetime
from distutils.util import strtobool

from fabric.api import local, require, put, run, env, serial
from fabric.context_managers import lcd


env.path = "/home/oyiptong/splice"
env.use_ssh_config = True
env.num_keep_releases = 5
env.release = time.strftime("%Y-%m-%dT%H-%M-%S", datetime.utcnow().timetuple())


def to_bool(value):
    if not isinstance(value, bool):
        return strtobool(value)
    else:
        return value


def upload_from_git():
    """
    Create tarball, send over the wire and untar
    """
    require("release")
    local("git archive --format=tar master | bzip2 > %(release)s.tar.bz2" % env)
    put("%(release)s.tar.bz2" % env, "/tmp/")

    run("mkdir -p %(path)s/%(release)s" % env)
    run("cd %(path)s/%(release)s && tar xjf /tmp/%(release)s.tar.bz2" % env)
    run("rm /tmp/%(release)s.tar.bz2" % env)

    local("rm %(release)s.tar.bz2" % env)


def clean_release_dir():
    """
    Delete releases if the number of releases to keep has gone beyond the threshold set by num_keep_releases
    """
    if env.num_keep_releases > 1:
        # keep at least 2 releases: one previous and one current
        releases = run("find %(path)s -maxdepth 1 -mindepth 1 -type d | sort" % env).split()
        if len(releases) > env.num_keep_releases:
            delete_num = len(releases) - env.num_keep_releases
            delete_list = " ".join(releases[:delete_num])
            run("rm -rf {0}".format(delete_list))


def set_symlinks():
    require("release")
    run("if [ -h %(path)s/previous ]; then rm %(path)s/previous; fi" % env)
    run("if [ -h %(path)s/current ]; then mv %(path)s/current %(path)s/previous; fi" % env)
    run("ln -s %(path)s/%(release)s %(path)s/current" % env)


def setup_virtualenv():
    require("release")
    run("cd %(path)s/%(release)s && MOZ_UPHEADLINER_PROD=1 ./setup-project.sh" % env)


def test(config="setup.cfg", debug_errors=False, debug_failures=False):
    """
    Run automated tests.
    If debug_errors is provided as a truey value, will drop on debug prompt as
    soon as an exception bubbles out from the tests.
    If debug_failures is provided as a truey value, will drop on debug prompt
    as soon as an assertion fails.
    """
    command = "nosetests --nologcapture --config={}".format(config)
    if to_bool(debug_errors):
        command += " --ipdb"
    if to_bool(debug_failures):
        command += " --ipdb-failures"
    local(command)


def flake(config="flake8.cfg"):
    local("flake8 . --config={}".format(config))


def build():
    test()
    flake()
    package()


def deploy_cold():
    """
    Deploy code but don"t change current running version
    """
    upload_from_git()
    setup_virtualenv()
    clean_release_dir()
    set_symlinks()


def build_ui():
    local('rm -rf splice/static/build')

    with lcd('ui'):
        local('npm install')
        local('npm run bundle')

    with lcd('front_end'):
        local('npm install')
        local('npm run build:dist')
        local('mv dist ../splice/static/build/campaign-manager')


@serial
def package(clean=True):
    if to_bool(clean):
        local("rm -rf build/")
    local("python setup.py build")
