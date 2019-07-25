Scriptis is a data analysis tool based on Linkis. Before deploying Scriptis, you need to deploy Linkis first. For the Linkis deploy document, see: [Linkis DeployDoc]()

## 1 Preparation

### （1）Click release to select the corresponding installation package to download

### （2）Unzip the downloaded installation package

## 2 Deploy

### (1) Install Nginx

```
sudo yum install nginx -y
```

### (2) Create an Nginx configuration file (you can modify the file name by yourself)

```
sudo vi /etc/nginx/conf.d/scriptis.conf
```

### (3) Modify and save the configuration file created above

```
server {
            listen       8080;# Access Port
            server_name  localhost;
            #charset koi8-r;
            #access_log  /var/log/nginx/host.access.log  main;
            location / {
            root   /appcom/Install/scriptis/ROOT; # decompression directory
            index  index.html index.html;
            }
            location /ws {#webSocket configuration support 
            proxy_pass http://192.168.xxx.xxx:9001;# IP port of the linkis-gateway service
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            }
            location /api {
            proxy_pass http://192.168.xxx.xxx:9001; # IP port of the linkis-gateway service
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header x_real_ipP $remote_addr;
            proxy_set_header remote_addr $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_http_version 1.1;
            proxy_connect_timeout 4s;
            proxy_read_timeout 600s;
            proxy_send_timeout 12s;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection upgrade;
            }
            #error_page  404              /404.html;
            # redirect server error pages to the static page /50x.html
            #
            error_page   500 502 503 504  /50x.html;
            location = /50x.html {
            root   /usr/share/nginx/html;
            }
        }
```

## 3 Start Service

```
sudo systemctl restart nginx
```

## 4 FAQs

### (1) limitations on the size of files that being uploaded

```
sudo vi /etc/nginx/nginx.conf
```

Change the uploading size

```
client_max_body_size 200m
```

### (2) Interface timeout

```
sudo vi /etc/nginx/conf.d/scriptis.conf
```

Change the time of interface timeout

```
proxy_read_timeout 600s
```

