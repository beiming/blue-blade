from functools import wraps

from flask import jsonify, render_template, request, abort


def _message(message, code):
    return jsonify({'message': message}), code


def not_found_error(message='Not Found'):
    return _message(message, 404)


def conflict_error(message=''):
    return _message(message, 409)


def bad_request_error(message=''):
    return _message(message, 400)


def internal_server_error(message=''):
    return _message(message, 500)


def bad_request_with_data(data=None):
    return jsonify(data or {}), 400


def forbidden_error(message=''):
    return _message(message, 403)


def authentication_failed(message=''):
    return _message(message, 401)


def validation_failed(errors=None):
    return jsonify({'errors': errors or {}}), 400


def success_with_message(message="", status_code=200):
    return _message(message, status_code)


def success(data=None):
    return jsonify(data or {}), 200


def creation_success(data=None):
    return jsonify(data or {}), 201


def object_not_found(message):
    return _message(message, 204)


def check_if_ajax_call():
    is_ajax = request.headers.get('Content-Type').startswith('application/json')
    if not is_ajax:
        abort(404)
        return False

    return True


def templated(template=None):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            template_name = template
            if template_name is None:
                template_name = request.endpoint.replace('.', '/') + '.html'

            ctx = f(*args, **kwargs)
            if ctx is None:
                ctx = {}
            elif not isinstance(ctx, dict):
                return ctx

            return render_template(template_name, **ctx)

        return decorated_function

    return decorator
