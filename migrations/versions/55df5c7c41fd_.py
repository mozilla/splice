"""empty message

Revision ID: 55df5c7c41fd
Revises: 25c409de54cc
Create Date: 2017-06-15 15:21:31.645055

"""

# revision identifiers, used by Alembic.
revision = '55df5c7c41fd'
down_revision = '25c409de54cc'
branch_labels = None
depends_on = None

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

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
    op.create_table('assa_events_daily',
    sa.Column('client_id', sa.String(length=64), nullable=False),
    sa.Column('addon_version', sa.String(length=64), nullable=False),
    sa.Column('source', sa.String(length=64), nullable=False),
    sa.Column('session_id', sa.String(length=64), nullable=False),
    sa.Column('page', sa.String(length=64), nullable=False),
    sa.Column('action_position', sa.String(length=16), nullable=False),
    sa.Column('event', sa.String(length=64), nullable=False),
    sa.Column('receive_at', sa.DateTime(), nullable=False),
    sa.Column('date', sa.Date(), nullable=False),
    sa.Column('locale', sa.String(length=14), nullable=False),
    sa.Column('country_code', sa.String(length=5), nullable=False),
    sa.Column('os', sa.String(length=64), nullable=False),
    sa.Column('browser', sa.String(length=64), nullable=False),
    sa.Column('version', sa.String(length=64), nullable=False),
    sa.Column('device', sa.String(length=64), nullable=False)
    )
    op.create_table('assa_masga_daily',
    sa.Column('client_id', sa.String(length=64), nullable=False),
    sa.Column('addon_version', sa.String(length=64), nullable=False),
    sa.Column('source', sa.String(length=64), nullable=False),
    sa.Column('session_id', sa.String(length=64), nullable=True),
    sa.Column('page', sa.String(length=64), nullable=False),
    sa.Column('event', sa.String(length=64), nullable=False),
    sa.Column('value', sa.Integer(), nullable=False),
    sa.Column('receive_at', sa.DateTime(), nullable=False),
    sa.Column('date', sa.Date(), nullable=False),
    sa.Column('locale', sa.String(length=14), nullable=False),
    sa.Column('country_code', sa.String(length=5), nullable=False),
    sa.Column('os', sa.String(length=64), nullable=False),
    sa.Column('browser', sa.String(length=64), nullable=False),
    sa.Column('version', sa.String(length=64), nullable=False),
    sa.Column('device', sa.String(length=64), nullable=False)
    )
    op.create_table('assa_performance_daily',
    sa.Column('client_id', sa.String(length=64), nullable=False),
    sa.Column('addon_version', sa.String(length=64), nullable=False),
    sa.Column('source', sa.String(length=64), nullable=False),
    sa.Column('session_id', sa.String(length=64), nullable=True),
    sa.Column('page', sa.String(length=64), nullable=False),
    sa.Column('event', sa.String(length=64), nullable=False),
    sa.Column('event_id', sa.String(length=64), nullable=False),
    sa.Column('value', sa.Integer(), nullable=False),
    sa.Column('receive_at', sa.DateTime(), nullable=False),
    sa.Column('date', sa.Date(), nullable=False),
    sa.Column('locale', sa.String(length=14), nullable=False),
    sa.Column('country_code', sa.String(length=5), nullable=False),
    sa.Column('os', sa.String(length=64), nullable=False),
    sa.Column('browser', sa.String(length=64), nullable=False),
    sa.Column('version', sa.String(length=64), nullable=False),
    sa.Column('device', sa.String(length=64), nullable=False)
    )
    op.create_table('assa_sessions_daily',
    sa.Column('client_id', sa.String(length=64), nullable=False),
    sa.Column('addon_version', sa.String(length=64), nullable=False),
    sa.Column('page', sa.String(length=64), nullable=False),
    sa.Column('session_duration', sa.Integer(), nullable=False),
    sa.Column('session_id', sa.String(length=64), nullable=False),
    sa.Column('load_trigger_type', sa.String(length=64), nullable=True),
    sa.Column('load_trigger_ts', postgresql.DOUBLE_PRECISION(), nullable=True),
    sa.Column('visibility_event_rcvd_ts', postgresql.DOUBLE_PRECISION(), nullable=True),
    sa.Column('receive_at', sa.DateTime(), nullable=False),
    sa.Column('date', sa.Date(), nullable=False),
    sa.Column('locale', sa.String(length=14), nullable=False),
    sa.Column('country_code', sa.String(length=5), nullable=False),
    sa.Column('os', sa.String(length=64), nullable=False),
    sa.Column('browser', sa.String(length=64), nullable=False),
    sa.Column('version', sa.String(length=64), nullable=False),
    sa.Column('device', sa.String(length=64), nullable=False)
    )
    ### end Alembic commands ###


def downgrade_stats():
    ### commands auto generated by Alembic - please adjust! ###
    import os
    if os.environ.get("SPLICE_IGNORE_REDSHIFT", "") == "true":
        return
    op.drop_table('assa_sessions_daily')
    op.drop_table('assa_performance_daily')
    op.drop_table('assa_masga_daily')
    op.drop_table('assa_events_daily')
    ### end Alembic commands ###
