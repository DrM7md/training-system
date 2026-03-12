import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('185.224.137.29', port=65002, username='u229998316', password='Mm5500!@', timeout=30)

cmds = [
    # Check if .hot file exists
    'ls -la /home/u229998316/domains/kbinhschool.com/public_html/TrainingWeb/public/hot 2>&1',
    # Check manifest format
    'head -5 /home/u229998316/domains/kbinhschool.com/public_html/TrainingWeb/public/build/manifest.json',
    # Check if build dir has .vite/manifest.json (Vite 5+ puts it there)
    'ls -la /home/u229998316/domains/kbinhschool.com/public_html/TrainingWeb/public/build/.vite/ 2>&1',
    # Clear everything and retry
    'cd /home/u229998316/domains/kbinhschool.com/public_html/TrainingWeb && php artisan optimize:clear 2>&1 && php artisan config:cache 2>&1 && php artisan view:clear 2>&1',
    # Try to access via curl
    'curl -s -o /dev/null -w "%{http_code}" https://training.kbinhschool.com/login 2>&1',
]

for cmd in cmds:
    print(f'>>> {cmd.split("/TrainingWeb/")[-1] if "/TrainingWeb/" in cmd else cmd[:80]}')
    stdin, stdout, stderr = client.exec_command(cmd, timeout=60)
    print(stdout.read().decode())
    err = stderr.read().decode()
    if err: print(f'ERR: {err}')
    print('---')
client.close()
