from functools import wraps

from flask_sqlalchemy import SQLAlchemy
from werkzeug.local import Local, release_local

db = SQLAlchemy()

_local = Local()


def transaction(callback=None):
    def decorator(f):

        # noinspection PyUnresolvedReferences
        @wraps(f)
        def decorated_function(*args, **kwargs):
            sp = hasattr(_local, 'transaction_begin')
            if not sp:
                _local.transaction_begin = True

            try:
                rt = f(*args, **kwargs)

                if not sp:
                    db.session.commit()
                    if callback:
                        callback()

                return rt
            except:
                if not sp:
                    db.session.rollback()
                raise
            finally:
                if not sp:
                    release_local(_local)

        return decorated_function

    return decorator
