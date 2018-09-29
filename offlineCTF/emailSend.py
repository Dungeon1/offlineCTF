import smtplib
import email.mime.application
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


from letter import html

def emailRegistrationSend(username, password, toaddr, me, user_passwd):
    if me == None: 
        return

    server = 'smtp.mail.ru' # Сервер отпраитель
    port = 587 # возможные порты: 587, 465 (25)
    user_name=me # Адрес отправителя
    user_passwd # Пароль отправителя
    # Формируем заголовок письма
    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'Заголовок письма'
    msg['From'] = me
    msg['To'] = toaddr # отправка 2-м адресаиам
    # PDF attachment
    #filename='script.sh'
    #fp=open(filename,'rb')
    #att = email.mime.application.MIMEApplication(fp.read(),_subtype="sh")
    #fp.close()
    #att.add_header('Content-Disposition','attachment',filename=filename)
    #msg.attach(att)
    # Формируем письмо
    username = str(username)
    password = str(password)
    new_html = html.format(username, password)
    part1 = MIMEText(new_html, 'html')
    #part3 = MIMEText('Содержимое приложенного файла')
    msg.attach(part1)
    #msg.attach(part3)
    # Подключение
    print('Подключение')
    s = smtplib.SMTP(server, port)
    s.ehlo()
    s.starttls()
    s.ehlo()
    # Авторизация
    print('Авторизация')
    s.login(user_name, user_passwd)
    # Отправка пиьма
    print('Отправка письма')
    try:
        s.sendmail(me, toaddr, msg.as_string())
        s.quit()
        print('Получилось отправить')
        return True
    except:
        print('Не получилось отправить')
        return False
    
    
def emailForgotPassword(username, email, randomPassword, me, user_passwd):
    print("Зашел в функцию отправки нового пароля")
    toaddr = str(email)  #Адрес получателя
    server = 'smtp.mail.ru' # Сервер отпраитель
    port = 587 # возможные порты: 587, 465, (25)
    user_name=me  # Адрес отправителя
    user_passwd # Пароль отправителя
    # Формируем заголовок письма
    msg = MIMEMultipart('mixed')
    msg['Subject'] = 'Заголовок письма'
    msg['From'] = me
    msg['To'] = toaddr
    # Формируем письмо
    message = "Ваш username:" + str(username) + "\n" + " Ваш новый пароль:" + str(randomPassword) + "\n" + "Данный пароль сгенирирован случайно, его можно поменять на свой в личном кабинете"
    print(message)
    part1 = MIMEText('Смена пароля', 'plain')
    part2 = MIMEText(message)
    msg.attach(part1)
    msg.attach(part2)
    # Подключение
    s = smtplib.SMTP(server, port)
    s.ehlo()
    s.starttls()
    s.ehlo()
    # Авторизация
    s.login(user_name, user_passwd)
    # Отправка пиьма
    print('Отправка письма')
    try:
        s.sendmail(me, toaddr, msg.as_string())
        s.quit()
        print('Получилось отправить')
        return True
    except:
        print('Не получилось отправить')
        return False
    print("Выходит из функции отправки письма")
