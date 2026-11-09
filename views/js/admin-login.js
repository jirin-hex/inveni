const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit',async(e)=>{
    e.preventDefault();
    document.getElementById('loginError').textContent = '';

     try{
        const email = document.getElementById('email').value.trim();
const password = document.getElementById('password').value;

const response = await fetch('/api/auth/login',{
    method: 'POST',
    headers: {
        'content-type': 'application/json'
    },
    body: JSON.stringify({
        email,
        password
    })
});

const data = await response.json();

if(!response.ok){
    document.getElementById('loginError').textContent = data.message;
    return;
}

window.location.href = './admin/index.html';
    } catch(error){
        console.error(error);
        document.getElementById('loginError').textContent = 'Unable to connect to the server. Please try again.';
    }



})
   