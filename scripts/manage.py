#!/usr/bin/env python
from flask.ext.script import Manager
from flask.ext.migrate import MigrateCommand
from splice.utils import environment_manager_create
from splice.commands import GunicornServerCommand, SeedDataCommand

manager = Manager(environment_manager_create)
manager.add_option('-c', '--config', dest='config', required=False)
manager.add_command('runserver_gunicorn', GunicornServerCommand())
manager.add_command('db', MigrateCommand)
manager.add_command('seed_data', SeedDataCommand)

if __name__ == "__main__":
    manager.run()
