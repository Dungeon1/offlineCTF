import dataset
import json
import random
import time
import hashlib
import datetime
import os
import dateutil.parser
import bleach
import urllib.request

from base64 import b64decode
from base64 import b64encode
from functools import wraps

from sqlalchemy import event
from sqlalchemy.engine import Engine
from sqlite3 import Connection as SQLite3Connection
from werkzeug.contrib.fixers import ProxyFix

from flask import Flask
from flask import jsonify
from flask import make_response
from flask import redirect
from flask import render_template
from flask import request
from flask import session
from flask import url_for
from flask import Response


app = Flask(__name__, static_folder='static', static_url_path='')
db = None
lang = None
config = None

descAllowedTags = bleach.ALLOWED_TAGS + ['br', 'pre']

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('error', msg='login_required'))
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('error', msg='login_required'))
        user = get_user()
        if user["isAdmin"] == False:
            return redirect(url_for('error', msg='admin_required'))
        return f(*args, **kwargs)
    return decorated_function

def get_user():
    db = dataset.connect(config['db'])

    login = 'user_id' in session
    if login:
        return db['users'].find_one(id=session['user_id'])

    return None

def get_task(tid):
    db = dataset.connect(config['db'])

    task = db.query("SELECT t.*, c.name cat_name FROM tasks t JOIN categories c on c.id = t.category WHERE t.id = :tid",
            tid=tid)

    return task.next()

def get_flags():
    db = dataset.connect(config['db'])

    flags = db.query('''select f.task_id from flags f
        where f.user_id = :user_id''',
        user_id=session['user_id'])
    return [f['task_id'] for f in list(flags)]

def get_total_completion_count():
    db = dataset.connect(config['db'])
    c = db.query("select t.id, count(t.id) count from tasks t join flags f on t.id = f.task_id group by t.id;")

    res = {}
    for r in c:
        res.update({r['id']: r['count']})

    return res

def get_main_menu():
    db = dataset.connect(config['db'])
    menu = list(db.query("SELECT * FROM pages"))

    if menu:
        return menu

    return None

def get_cats(url):
    db = dataset.connect(config['db'])

    user = get_user()
    isUser = "0"
    if user: isUser = "1"
    isAdmin = "0"
    if (user and user['isAdmin']): isAdmin = "1"

    cats = list(db.query("SELECT cats.* FROM categories cats, pages p WHERE cats.page_id = p.id AND p.url == '" + url + "'"))
    
    if cats:
        return cats

    return list()

@app.route('/error/<msg>')
def error(msg):
    """Displays an error message"""

    if msg in lang['error']:
        message = lang['error'][msg]
    else:
        message = lang['error']['unknown']

    user = get_user()
    menu = get_main_menu()

    render = render_template('frame.html', lang=lang, page='error.html',
        message=message, user=user, menu=menu)
    return make_response(render)

@app.route('/noerror/<msg>')
def noerror(msg):
    """Displays an error message"""

    if msg in lang['error']:
        message = lang['error'][msg]
    else:
        message = lang['error']['unknown']

    user = get_user()
    menu = get_main_menu()

    render = render_template('frame.html', lang=lang, page='noerror.html',
        message=message, user=user, menu=menu)
    return make_response(render)

def session_login(username):
    db = dataset.connect(config['db'])
    user = db['users'].find_one(username=username)
    session['user_id'] = user['id']

@event.listens_for(Engine, "connect")
def _set_sqlite_pragma(dbapi_connection, connection_record):
    if isinstance(dbapi_connection, SQLite3Connection):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON;")
        cursor.close()

@app.route('/login', methods = ['POST'])
def login():
    db = dataset.connect(config['db'])

    from werkzeug.security import check_password_hash

    username = request.form['user'].strip()
    password = request.form['password']

    user = db['users'].find_one(username=username)
    if user is None:
        return redirect('/error/invalid_credentials')

    if check_password_hash(user['password'], password):
        session_login(username)
        return redirect('/tasks')
    
    return redirect('/error/invalid_credentials')

def checkRecaptcha(response, secretkey):
    url = 'https://www.google.com/recaptcha/api/siteverify?'
    url = url + 'secret=' +secretkey
    url = url + '&response=' +response
    try:
        jsonobj = json.loads((urllib.request.urlopen(url).read()).decode("utf-8"))
        if jsonobj['success']:
            return True
        else:
            return False
    except:
        return False

@app.route('/forgot/submit', methods = ['POST'])
def forgot_submit():
    db = dataset.connect(config['db'])
    userCount = db['users'].count()
    if datetime.datetime.today() < config['startTime'] and userCount != 0:
        return redirect('/error/not_started')

    username = request.form['user']
    user = db['users'].find_one(username=username)

    if user is None:
        return redirect('/error/invalid_credentials')

    from werkzeug.security import generate_password_hash
    from emailSend import emailForgotPassword
    import string

    # Генерация нового пароля
    password = ''.join(random.choices(string.ascii_uppercase + string.digits + string.ascii_lowercase, k=16))
    randomPasswordHash=generate_password_hash(password)
    db.query('''UPDATE users SET password = :newPass WHERE username= :username''', newPass=randomPasswordHash, username=username)
    emailForgotPassword(username, password, user["email"], config['email'], config['email_password'])

    user['password'] = generate_password_hash(password)

    return redirect('/')

@app.route('/register/submit', methods = ['POST','GET'])
def register_submit():
    db = dataset.connect(config['db'])
    userCount = db['users'].count()
    if datetime.datetime.today() < config['startTime'] and userCount != 0:
        return redirect('/error/not_started')

    from werkzeug.security import generate_password_hash
    username = request.form['user'].strip()
    password = request.form['password']
    email = request.form['email'].strip()
    region = request.form['region']
    school = request.form['school']
    response = request.form.get('g-recaptcha-response')
    user_found = db['users'].find_one(username=username)
    if not user_found:
        user_found = db['users'].find_one(email=email)

    isAdmin = False
    isHidden = False
    userCount = db['users'].count()

    if checkRecaptcha(response, config['CAPCHA_SECRET_KEY']):   
        if not username:
            return redirect('/error/empty_user')
        elif user_found:
            return redirect('/error/already_registered')
        else:
            from emailSend import emailRegistrationSend
            emailRegistrationSend(username, password, email, config['email'], config['email_password'])
    
        if userCount == 0:
            isAdmin = True
            isHidden = True
        elif datetime.datetime.today() < config['startTime']:
            return redirect('/noerror/register_complete')
    else:
        return redirect('error/bot')

    new_user = dict(username=username, password=generate_password_hash(password),
        isAdmin=isAdmin,
        isHidden=isHidden,
		region=region,
		school=school,
        email=email)

    db['users'].insert(new_user)
    
    session_login(username)
    
    return redirect('/tasks')

@app.route('/tasks')
@login_required
def tasks():
    # Главная страница
    db = dataset.connect(config['db'])

    url = '/tasks'

    user = get_user()
    menu = get_main_menu()
    cats = get_cats(url)

    userCount = db['users'].count(isHidden=0)
    isAdmin = user['isAdmin']

    categories = db.query("SELECT * FROM categories WHERE page_id == 2")

    flags = get_flags()

    tasks = db.query("SELECT * FROM tasks ORDER BY category, score")
    tasks = list(tasks)
    taskCompletedCount = get_total_completion_count()

    tasksdone = db.query("SELECT * FROM flags WHERE user_id = " + str(user['id']))

    grid = []

    for cat in categories:
        cTasks = [x for x in tasks if x['category'] == cat['id']]
        gTasks = []

        gTasks.append(cat)
        for task in cTasks:
            tid = task['id']
            if tid in taskCompletedCount:
                percentComplete = (float(taskCompletedCount[tid]) / userCount) * 100
            else:
                percentComplete = 0

            
            if percentComplete == 100:
                percentComplete = 99.99

            task['percentComplete'] = percentComplete
            task['isDone'] = False
            for taskdone in tasksdone:
                if (taskdone['task_id'] == task['id']):
                    task['isDone'] = True
                    break
                    
            task['isComplete'] = tid in flags
            gTasks.append(task)

        #if isAdmin:
            #gTasks.append({'add': True, 'category': cat['id']})

        grid.append(gTasks)

    render = render_template('frame.html', lang=lang, cats=cats, url=url,
        user=user, menu=menu, grid=grid, tasksdone=tasksdone)
    return make_response(render)

@app.route('/addcat/', methods=['POST'])
@admin_required
def addcatsubmit():
    try:
        name = bleach.clean(request.form['name'], tags=[])
    except KeyError:
        return redirect('/error/form')
    else:
        db = dataset.connect(config['db'])
        categories = db['categories']
        id = len(list(categories)) + 1
        categories.insert(dict(id=id, page_id=2, name=name))
        return redirect('/tasks')

@app.route('/editcat/<catId>/', methods=['POST'])
@admin_required
def editcatsubmit(catId):
    try:
        name = bleach.clean(request.form['name'], tags=[])
    except KeyError:
        return redirect('/error/form')
    else:
        db = dataset.connect(config['db'])
        categories = db['categories']
        categories.update(dict(name=name, id=catId), ['id'])
        return redirect('/tasks')

@app.route('/editcat/<catId>/delete')
@admin_required
def deletecatsubmit(catId):
    db = dataset.connect(config['db'])
    db['categories'].delete(id=catId)
    return redirect('/tasks')

@app.route('/addtask/<cat>/', methods=['POST'])
@admin_required
def addtasksubmit(cat):
    try:
        name = bleach.clean(request.form['name'], tags=[])
        desc = bleach.clean(request.form['desc'], tags=descAllowedTags)
        score = int(request.form['score'])
        flag = request.form['flag']
    except KeyError:
        return redirect('/error/form')

    else:
        db = dataset.connect(config['db'])
        tasks = db['tasks']
        task = dict(
                name=name,
                desc=desc,
                category=cat,
                score=score,
                flag=flag)
        file = request.files['file']

        if file:
            filename, ext = os.path.splitext(file.filename)
            
            filename = hashlib.md5(str(datetime.datetime.utcnow()).encode('utf-8')).hexdigest()
            
            if ext:
                filename = filename + ext
            file.save(os.path.join("static/files/", filename))
            task["file"] = filename

        tasks.insert(task)
        return redirect('/tasks')

@app.route('/tasks/<tid>/edit/', methods=['POST'])
@admin_required
def edittasksubmit(tid):
    try:
        name = bleach.clean(request.form['name'], tags=[])
        desc = bleach.clean(request.form['desc'], tags=descAllowedTags)
        score = int(request.form['score'])
        flag = request.form['flag']
    except KeyError:
        return redirect('/error/form')

    else:
        db = dataset.connect(config['db'])
        tasks = db['tasks']
        task = tasks.find_one(id=tid)
        task['id']=tid
        task['name']=name
        task['desc']=desc
        task['score']=score

        
        if flag:
            task['flag']=flag

        file = request.files['file']

        if file:
            filename, ext = os.path.splitext(file.filename)
            
            filename = hashlib.md5(str(datetime.datetime.utcnow()).encode('utf-8')).hexdigest()
            
            if ext:
                filename = filename + ext
            file.save(os.path.join("static/files/", filename))

            
            if task['file']:
                os.remove(os.path.join("static/files/", task['file']))

            task["file"] = filename

        tasks.update(task, ['id'])
        return redirect('/tasks')

@app.route('/tasks/<tid>/delete/')
@admin_required
def deletetasksubmit(tid):
    db = dataset.connect(config['db'])
    db['tasks'].delete(id=tid)
    return redirect('/tasks')

@app.route('/submit/<tid>/<flag>')
@login_required
def submit(tid, flag):
    db = dataset.connect(config['db'])
    log_flag = open('log_flag_ip.txt', 'a')
    user = get_user()

    task = get_task(tid)
    flags = get_flags()
    task_done = task['id'] in flags
    result = {'success': False}
    ip = request.remote_addr

    log_flag.write(" Submit flag from: "+user['username']+" "+flag+" "+task['flag']+" "+b64decode(flag).decode('utf-8')+" ip: {}".format(ip)+'\n')
    print ("Submit flag: ", flag, task['flag'], b64decode(flag).decode('utf-8'), "ip: {}".format(ip))
    if not task_done and task['flag'] ==  b64decode(flag).decode('utf-8'):
        
        timestamp = int(time.time()*1000)
        ip = request.remote_addr
        print ("flag correct submit from ip: {}".format(ip))

        
        new_flag = dict(task_id=task['id'], user_id=session['user_id'],
            score=task["score"], timestamp=timestamp, ip=ip)
        db['flags'].insert(new_flag)

        result['success'] = True
    log_flag.close()
    
    score = db.query('''select ifnull(sum(f.score), 0) as score  from users u left join flags f on u.id = f.user_id where u.username=:user_name''', user_name=user['username'])
    for row in score:
        score_user = row['score']
        
    """
    isTop = user['isTop']
    if (score_user >= 1000) and isTop == 0:
        db.query('''update users set isTop = 1 where username=:user_name''', user_name=user['username'])
    """
    return jsonify(result)

@app.route('/scoreboard')
@login_required
def scoreboard():
    # Таблица рекордов
    db = dataset.connect(config['db'])
   
    url = '/scoreboard'

    user = get_user()
    menu = get_main_menu()
    cats = get_cats(url)
    scores = db.query('''select u.username, u.region, u.school, ifnull(sum(f.score), 0) as score,
        max(timestamp) as last_submit from users u left join flags f
        on u.id = f.user_id where u.isHidden = 0 group by u.username
        order by score desc, last_submit asc;''')

    scores = list(scores)

    render = render_template('frame.html', lang=lang, cats=cats, url=url,
        user=user, menu=menu, scores=scores)
    return make_response(render)

@app.route('/scoreboard.json')
def scoreboard_json():
    # Получаем json с результатами всех участников
    db = dataset.connect(config['db'])
    scores = db.query('''select u.username, ifnull(sum(f.score), 0) as score,
        max(timestamp) as last_submit from users u left join flags f
        on u.id = f.user_id where u.isHidden = 0 group by u.username
        order by score desc, last_submit asc''')

    scores = list(scores)

    return Response(json.dumps(scores), mimetype='application/json') 

@app.route('/logout')
@login_required
def logout():
    del session['user_id']
    return redirect('/')

@app.route('/')
def index():
    # Главная страница
    url = '/'

    user = get_user()
    menu = get_main_menu()
    cats = get_cats(url)

    render = render_template('frame.html', lang=lang, cats=cats, url=url,
        user=user, menu=menu)
    return make_response(render)

# Загружаем конфигурацию с config.json и устанавливаем переменные
config_str = open('config.json', 'r',encoding="utf-8").read()
config = json.loads(config_str)

app.secret_key = config['secret_key']

if config['startTime']:
    config['startTime'] = dateutil.parser.parse(config['startTime'])
else:
    config['startTime'] = datetime.datetime.min

# Загружаем переменные с lang.json
lang_str = open(config['language_file'], 'r', encoding="utf-8").read()
lang = json.loads(lang_str)

lang = lang[config['language']]

if __name__ == '__main__':
    app.run(host=config['host'], port=config['port'],debug=config['debug'], threaded=False)
