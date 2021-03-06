"""empty message

Revision ID: 171b15035012
Revises: 456611d35239
Create Date: 2016-03-02 16:14:18.962790

"""

# revision identifiers, used by Alembic.
revision = '171b15035012'
down_revision = '456611d35239'
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
    op.create_table('activity_stream_stats_daily',
    sa.Column('client_id', sa.String(length=64), nullable=False),
    sa.Column('tab_id', sa.String(length=64), nullable=False),
    sa.Column('addon_version', sa.String(length=16), nullable=False),
    sa.Column('load_reason', sa.String(length=64), nullable=False),
    sa.Column('source', sa.String(length=64), nullable=False),
    sa.Column('unload_reason', sa.String(length=64), nullable=False),
    sa.Column('max_scroll_depth', sa.Integer(), nullable=False),
    sa.Column('load_latency', sa.Integer(), nullable=False),
    sa.Column('click_position', sa.Integer(), nullable=False),
    sa.Column('total_bookmarks', sa.Integer(), nullable=False),
    sa.Column('total_history_size', sa.Integer(), nullable=False),
    sa.Column('session_duration', sa.Integer(), nullable=False),
    sa.Column('receive_at', sa.DateTime(), nullable=False),
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
    op.drop_table('activity_stream_stats_daily')
    ### end Alembic commands ###

