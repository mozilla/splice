"""empty message

Revision ID: 525c5cd32d85
Revises: bc666ca893d
Create Date: 2015-02-04 14:16:18.170482

"""

# revision identifiers, used by Alembic.
revision = '525c5cd32d85'
down_revision = 'bc666ca893d'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.create_table('site_stats_daily',
    sa.Column('date', sa.Date(), nullable=False),
    sa.Column('month', sa.Integer(), nullable=False),
    sa.Column('week', sa.Integer(), nullable=False),
    sa.Column('year', sa.Integer(), nullable=False),
    sa.Column('locale', sa.String(length=14), nullable=False),
    sa.Column('url', sa.String(length=255), nullable=False),
    sa.Column('country_code', sa.String(length=5), nullable=False),
    sa.Column('os', sa.String(length=64), nullable=False),
    sa.Column('browser', sa.String(length=64), nullable=False),
    sa.Column('version', sa.String(length=64), nullable=False),
    sa.Column('device', sa.String(length=64), nullable=False),
    sa.Column('impressions', sa.Integer(), server_default='0', nullable=False),
    sa.Column('clicks', sa.Integer(), server_default='0', nullable=False),
    sa.Column('pinned', sa.Integer(), server_default='0', nullable=False),
    sa.Column('blocked', sa.Integer(), server_default='0', nullable=False),
    sa.Column('sponsored_link', sa.Integer(), server_default='0', nullable=False),
    sa.Column('sponsored', sa.Integer(), server_default='0', nullable=False)
    )
    op.create_table('application_stats_daily',
    sa.Column('date', sa.Date(), nullable=False),
    sa.Column('month', sa.Integer(), nullable=False),
    sa.Column('week', sa.Integer(), nullable=False),
    sa.Column('year', sa.Integer(), nullable=False),
    sa.Column('locale', sa.String(length=14), nullable=False),
    sa.Column('action', sa.String(length=255), nullable=False),
    sa.Column('country_code', sa.String(length=5), nullable=False),
    sa.Column('os', sa.String(length=64), nullable=False),
    sa.Column('browser', sa.String(length=64), nullable=False),
    sa.Column('version', sa.String(length=64), nullable=False),
    sa.Column('device', sa.String(length=64), nullable=False),
    sa.Column('ver', sa.String(length=16), nullable=False),
    sa.Column('count', sa.Integer(), nullable=False)
    )
    op.create_table('countries',
    sa.Column('country_name', sa.String(length=255), nullable=False),
    sa.Column('country_code', sa.String(length=5), nullable=False)
    )
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('countries')
    op.drop_table('application_stats_daily')
    op.drop_table('site_stats_daily')
    ### end Alembic commands ###
