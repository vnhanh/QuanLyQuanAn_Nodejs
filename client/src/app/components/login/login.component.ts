import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  message;
  messageClass;
  processing =false;
  form: FormGroup;
  previousUrl;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private authGuard: AuthGuard
  ) { 
    this.createForm();
  }
  createForm(){
    this.form = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    })
  }
  disableForm(){
    this.form.controls['username'].disable();
    this.form.controls['password'].disable();
  }
  enableForm(){
    this.form.controls['username'].enable();
    this.form.controls['password'].enable();
  }
  onLoginSubmit(){
    this.processing =true;
    this.disableForm();
    if(!this.authService.socket.connected){
    this.messageClass= 'alert alert-danger';
    this.message="Không có kết nối với server";
    setTimeout(() => {
      //  this.form.reset(); // Reset all form fields
        this.messageClass = false; // Erase error/success message
        this.message='';
        this.enableForm();
        this.processing= false;
      }, 3000);
    }
    const user ={
      username: this.form.get('username').value,
      password: this.form.get('password').value
    }
    this.authService.login(user).subscribe(data=>{
      if(!data.success){
        this.messageClass= 'alert alert-danger';
        this.message=data.message;
        this.processing= false;
        this.enableForm();
      }else{
        this.messageClass = 'alert alert-success';
        this.message= data.message;
        this.authService.storeUserData(data.token, data.user);
        
          if(this.previousUrl){
            this.router.navigate([this.previousUrl]);
          }else{
            this.router.navigate(['/profile']);
          }
  
      }
    })
  }

  ngOnInit() {
    if(this.authGuard.redirectUrl){
      this.messageClass = 'alert alert-danger';
      this.message = 'You must be logged in to view that page.';
      this.previousUrl = this.authGuard.redirectUrl;
      this.authGuard.redirectUrl = undefined;
    }
  }

}
