#!/usr/bin/env python
import sys
from flask.ext.script import Manager
from flask.ext.script.commands import InvalidCommand
from flask.ext.migrate import MigrateCommand
from splice.utils import environment_manager_create
from splice.commands import GunicornServerCommand, DataCommand

manager = Manager(environment_manager_create)
manager.add_option('-c', '--config', dest='config', required=False)
manager.add_command('runserver_gunicorn', GunicornServerCommand())
manager.add_command('db', MigrateCommand)
manager.add_command('data', DataCommand)

if __name__ == "__main__":
    try:
        manager.run()
    except InvalidCommand, e:
        print >> sys.stderr, e
        sys.exit(1)
