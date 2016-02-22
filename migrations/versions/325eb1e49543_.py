"""empty message

Revision ID: 325eb1e49543
Revises: 137eeadf84cb
Create Date: 2016-02-12 15:48:06.740506

"""

# revision identifiers, used by Alembic.
revision = '325eb1e49543'
down_revision = '137eeadf84cb'
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
    op.create_table('contents',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=False),
    sa.Column('version', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text(u'now()'), nullable=False),
    sa.Column('key_id', sa.String(length=64), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    ### end Alembic commands ###


def downgrade_():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('contents')
    ### end Alembic commands ###


def upgrade_stats():
    ### commands auto generated by Alembic - please adjust! ###
    pass
    ### end Alembic commands ###


def downgrade_stats():
    ### commands auto generated by Alembic - please adjust! ###
    pass
    ### end Alembic commands ###
