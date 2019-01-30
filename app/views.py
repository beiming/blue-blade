import datetime

from flask import Blueprint
from sqlalchemy.exc import InternalError

from . import db
from .utils import templated

bp = Blueprint('', __name__)


@bp.route('/')
@templated()
def index():
    sql = '''select name from user limit 10'''
    try:
        execution = db.session.execute(sql)
        rows = execution.fetchall()
    except InternalError:
        rows = [{'id': i, 'name': 'user_{}'.format(i)} for i in range(10)]

    results = [{key: value if not isinstance(value, datetime.datetime) else value.strftime('%Y-%m-%d %H:%M:%S') for
                (key, value) in row.items()} for row in rows]
    return {
        'users': results
    }
