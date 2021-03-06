"""empty message

Revision ID: 49387f326d6a
Revises: 2809b3efc07e
Create Date: 2017-08-15 11:34:22.454191

"""

# revision identifiers, used by Alembic.
revision = '49387f326d6a'
down_revision = '2809b3efc07e'
branch_labels = None
depends_on = None

from alembic import op
import sqlalchemy as sa


def upgrade(engine_name):
    globals()["upgrade_%s" % engine_name]()


def downgrade(engine_name):
    globals()["downgrade_%s" % engine_name]()





def upgrade_():
    ### commands auto generated by Alembic - please adjust! ###
    pass
    ### end Alembic commands ###


def downgrade_():
    ### commands auto generated by Alembic - please adjust! ###
    pass
    ### end Alembic commands ###


def upgrade_stats():
    ### commands auto generated by Alembic - please adjust! ###
    import os
    if os.environ.get("SPLICE_IGNORE_REDSHIFT", "") == "true":
        return
    op.create_table('assa_impression_stats_daily',
    sa.Column('client_id', sa.String(length=64), nullable=False),
    sa.Column('tile_id', sa.Integer(), nullable=False),
    sa.Column('addon_version', sa.String(length=64), nullable=False),
    sa.Column('date', sa.Date(), nullable=False),
    sa.Column('impressions', sa.Integer(), server_default='0', nullable=False),
    sa.Column('clicks', sa.Integer(), server_default='0', nullable=False),
    sa.Column('pinned', sa.Integer(), server_default='0', nullable=False),
    sa.Column('blocked', sa.Integer(), server_default='0', nullable=False),
    sa.Column('pocketed', sa.Integer(), server_default='0', nullable=False),
    sa.Column('position', sa.Integer(), server_default='0', nullable=False),
    sa.Column('page', sa.String(length=64), nullable=False),
    sa.Column('source', sa.String(length=64), nullable=False),
    sa.Column('locale', sa.String(length=14), nullable=False),
    sa.Column('country_code', sa.String(length=5), nullable=False),
    sa.Column('os', sa.String(length=64), nullable=False),
    sa.Column('browser', sa.String(length=64), nullable=False),
    sa.Column('version', sa.String(length=64), nullable=False),
    sa.Column('device', sa.String(length=64), nullable=False),
    sa.Column('blacklisted', sa.Boolean(), server_default='false', nullable=False),
    sa.Column('user_prefs', sa.Integer(), nullable=True)
    )
    ### end Alembic commands ###


def downgrade_stats():
    ### commands auto generated by Alembic - please adjust! ###
    import os
    if os.environ.get("SPLICE_IGNORE_REDSHIFT", "") == "true":
        return
    op.drop_table('assa_impression_stats_daily')
    ### end Alembic commands ###

