from invoke import task


@task
def init(ctx, language):
    ctx.run('pybabel init -i {app_path}/i18n/messages.pot -d {app_path}/i18n -l {language}'
            .format(app_path=ctx['app_path'], language=language))
    ctx.run('invoke i18n.update')


@task
def update(ctx):
    ctx.run('pybabel extract -F babel.cfg -k lazy_gettext -o {app_path}/i18n/messages.pot .'
            .format(app_path=ctx['app_path']))
    ctx.run('pybabel update -i {app_path}/i18n/messages.pot -d {app_path}/i18n'.format(app_path=ctx['app_path']))


@task
def compile(ctx):
    ctx.run('pybabel compile -d {app_path}/i18n'.format(app_path=ctx['app_path']))
