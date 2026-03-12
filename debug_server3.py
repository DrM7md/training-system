import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('185.224.137.29', port=65002, username='u229998316', password='Mm5500!@', timeout=30)

cmd = 'grep -A2 "local.ERROR\\|Exception\\|Error" /home/u229998316/domains/kbinhschool.com/public_html/TrainingWeb/storage/logs/laravel.log 2>&1 | tail -30'
print('>>> Getting errors from log...')
stdin, stdout, stderr = client.exec_command(cmd, timeout=60)
print(stdout.read().decode())

# Also try accessing dashboard via artisan
cmd2 = 'cd /home/u229998316/domains/kbinhschool.com/public_html/TrainingWeb && php artisan tinker --execute="echo app()->version();" 2>&1'
print('>>> PHP/Laravel version...')
stdin, stdout, stderr = client.exec_command(cmd2, timeout=60)
print(stdout.read().decode())
err = stderr.read().decode()
if err: print(err)

# Check Vite manifest path matches
cmd3 = 'cd /home/u229998316/domains/kbinhschool.com/public_html/TrainingWeb && php artisan vite:manifest 2>&1 || echo "---" && ls -la public/build/manifest.json 2>&1'
stdin, stdout, stderr = client.exec_command(cmd3, timeout=60)
print(stdout.read().decode())

client.close()
