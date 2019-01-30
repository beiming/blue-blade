import os

import pymysql
from flask import Flask, session, request
from flask_babel import Babel

from .database import db
from .utils import Assets


def _register_blueprints(app):
    from .views import bp as root_bp

    context_path = app.config['APP_CONTEXT_PATH']
    app.register_blueprint(root_bp, url_prefix=context_path + '/')


def _config_db(app):
    pymysql.install_as_MySQLdb()

    db.init_app(app)
    db.app = app


def _register_jinja_env_globals(app, dev_mode):
    app.jinja_env.globals['assets'] = Assets(os.path.dirname(__file__))
    app.jinja_env.globals['dev_mode'] = dev_mode
    app.jinja_env.globals['url'] = lambda url: app.config['APP_CONTEXT_PATH'] + url


def _setup_i18n(app):
    app.config['BABEL_TRANSLATION_DIRECTORIES'] = os.path.join(os.path.dirname(__file__), 'i18n')
    app.config['BABEL_DEFAULT_LOCALE'] = 'zh_Hans_CN'
    app.config['BABEL_DEFAULT_TIMEZONE'] = 'UTC'
    babel = Babel(app)

    babel_support_locales = ['en', 'en_us', 'zh', 'zh_CN', 'zh_TW']

    @babel.localeselector
    def get_locale():
        locale = session.get('use_locale', None)
        if locale:
            return locale

        return request.accept_languages.best_match(babel_support_locales, 'zh-CN')

    @babel.timezoneselector
    def get_timezone():
        return 'UTC'


def create_app(conf):
    app = Flask(__name__)
    app.config.from_pyfile(conf)

    _config_db(app)
    _register_blueprints(app)
    _register_jinja_env_globals(app, app.config['DEV_MODE'])
    _setup_i18n(app)

    return app
