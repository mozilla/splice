from sqlalchemy.orm.exc import NoResultFound

from splice.models import Account
from splice.queries.common import row_to_dict


def get_accounts():
    from splice.environment import Environment

    env = Environment.instance()

    rows = (
        env.db.session
        .query(Account)
        .order_by(Account.id.desc())
        .all()
    )
    output = [row_to_dict(d) for d in rows]

    return output


def get_account(id):
    from splice.environment import Environment

    env = Environment.instance()

    row = (
        env.db.session
        .query(Account).get(id)
    )
    return row_to_dict(row) if row else None


def insert_account(session, record):
    account = Account(**record)
    session.add(account)
    session.flush()
    return row_to_dict(account)


def update_account(session, account_id, record):
    account = session.query(Account).get(account_id)
    if account is None:
        raise NoResultFound('Account not found found')

    for key, val in record.items():
        setattr(account, key, val)

    return row_to_dict(account)
