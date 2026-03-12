import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('185.224.137.29', port=65002, username='u229998316', password='Mm5500!@', timeout=30)

project = '/home/u229998316/domains/kbinhschool.com/public_html/TrainingWeb'
cmds = [
    f"cd {project} && sed -i 's/^APP_NAME=.*/APP_NAME=\"نظام المركز\"/' .env && grep APP_NAME .env | head -1",
    f"cd {project} && php artisan config:cache 2>&1",
]

for cmd in cmds:
    stdin, stdout, stderr = client.exec_command(cmd, timeout=60)
    print(stdout.read().decode())
client.close()
print('Done!')
