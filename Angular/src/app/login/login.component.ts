import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  authorCorrect : boolean = false;
  seneca : boolean;
  notSeneca : boolean;
  author : String;

  constructor(
  ) { }

  ngOnInit(): void {
  }
  public async testAuthor(password){
    if(password == "Seneca"){
      this.seneca = true;
      this.notSeneca = false;
    }
    else if(password == "StackCanary"){
      
      this.authorCorrect = true;
      this.notSeneca = true;
      this.seneca = false;
    }    
    else{
      this.seneca = false;
      this.notSeneca = true;
    }
  }
}
