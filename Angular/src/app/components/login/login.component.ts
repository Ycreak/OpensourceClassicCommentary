import { Component, OnInit } from '@angular/core';
import { ServerCommunicator } from '../fragments/fragments.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  server = new ServerCommunicator(this.httpClient);
  passwd : String = '';
  authorCorrect : boolean = false;
  seneca : boolean;
  notSeneca : boolean;
  author : String;

  constructor(
    private httpClient: HttpClient
  ) { }

  ngOnInit(): void {
  }
  public async testAuthor(password){
    if(password == "Seneca"){
      this.seneca = true;
      this.notSeneca = false;
    }
    else{
      this.seneca = false;
      this.notSeneca = true;
    }
    let temp = await this.checkPassword('username', password) as JSON;
    let item = Number(temp);
    if(item == 1){
      this.authorCorrect = true;
    }
  }

  private async checkPassword(username: string, password: string){
    const data = await this.httpClient.get(
      this.server.serverURL + 'testHash',{
        params: { // Why toString()? Url is already a string! :D
          username:     username.toString(), 
          password:     password.toString(), 
        }
      })
      .toPromise();
      return data;  
  }

}
