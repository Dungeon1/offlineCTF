import smtplib
import email.mime.application
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def emailRegistrationSend(username, password, username_email, email, email_password):
    username = str(username)
    password = str(password)
    new_html = open('templates/letter.html', 'r', encoding="utf-8").read().format(username, password)
    workingWithEmail(username, password, username_email, email, email_password, MIMEText(new_html, 'html'))
    
    
def emailForgotPassword(username, password, username_email, email, email_password):
    username = str(username)
    password = str(password)
    new_html = open('templates/letter_registration.html', 'r', encoding="utf-8").read().format(username, password)
    workingWithEmail(username, password, username_email, email, email_password, MIMEText(new_html, 'html'))

def workingWithEmail(username, password, username_email, email, email_password, final_message):
    print('Работаем с почтой')

    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'Заголовок письма'
    msg['From'] = email
    msg['To'] = username_email
    msg.attach(final_message)

    # Подключение
    s = smtplib.SMTP(server, port)
    s.ehlo()
    s.starttls()
    s.ehlo()
    # Авторизация
    s.login(email, email_password)
    # Отправка пиьма
    print('Отправка письма...')
    try:
        s.sendmail(email, username_email, msg.as_string())
        s.quit()
        print('Получилось отправить')
        return True
    except:
        print('Не получилось отправить')
        return False
    print("Выходим из функции отправки письма")

server = 'smtp.mail.ru'
port = 587