import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FormControl, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import { ElementRef } from '@angular/core';
import { Observable } from 'rxjs';

// Component imports
import { ApiService } from '@oscc/api.service';
import { UtilityService } from '@oscc/utility.service';
import { AuthService } from '@oscc/auth/auth.service';
import { DialogService } from '@oscc/services/dialog.service';
import { User } from '@oscc/models/User';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  animations: [
    // For the User table
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class UsersComponent implements OnInit, AfterViewInit {
  // For the user table
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) matSort: MatSort;
  private table_sort: any;
  @ViewChild(MatSort) set content(content: Element) {
    this.table_sort = content;
    if (this.table_sort) {
      this.user_table_users.sort = this.table_sort;
    }
  }
  // User table specific variables
  user_table_columns_to_display: string[] = ['username', 'role'];
  user_table_users: MatTableDataSource<User>;
  user_table_columns_to_displayWithExpand = [...this.user_table_columns_to_display, 'expand'];
  user_table_expanded_element: string | null;

  // List with users shown in the Table
  retrieved_users: User[];

  /**
   * This form is used to change the password of the selected user.
   * After all validators, it will be parsed to a User object.
   */
  change_password_form = new FormGroup({
    password1: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z0-9-_]*')]),
    password2: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z0-9-_]*')]),
  });

  /**
   * This form is used to change the password of the selected user.
   * After all validators, it will be parsed to a User object.
   */
  create_new_user_form = new FormGroup({
    new_user: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z0-9-_]*')]),
    new_password: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z0-9-_]*')]),
  });

  table_data_loaded = false; // Returns true if the table has loaded its data
  loading_hint: Observable<unknown>; // Loading hint animation

  constructor(
    protected api: ApiService,
    protected utility: UtilityService,
    protected dialog: DialogService,
    protected auth_service: AuthService
  ) {
    // Assign the data to the data source for the table to render
    this.user_table_users = new MatTableDataSource(this.retrieved_users);
  }

  ngOnInit(): void {
    this.loading_hint = this.utility.get_loading_hint(); // Initialize the loading hint
    this.request_users();
  }

  ngAfterViewInit(): void {
    this.user_table_users.paginator = this.paginator;
    this.user_table_users.sort = this.matSort;
    this.expand_user_table_row();
  }

  /**
   * Function to allow the User table to be filtered indifferently of field
   * @param event that triggered the filtering process
   * @author Ycreak
   */
  protected apply_user_table_filter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.user_table_users.filter = filterValue.trim().toLowerCase();

    if (this.user_table_users.paginator) {
      this.user_table_users.paginator.firstPage();
    }
  }

  /**
   * Function to allow sorting of the User table
   * @param sort object that carries the sorting instructions provided by the Sort event
   * @author CptVickers
   */
  protected sort_user_table(sort: Sort): void {
    const data = this.user_table_users.data.slice();
    if (!sort.active || sort.direction === '') {
      this.user_table_users.data = data;
      return;
    }

    this.user_table_users.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'username':
          return compare(a.username, b.username, isAsc);
        case 'role':
          return compare(a.role, b.role, isAsc);
        default:
          return 0;
      }
      function compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
      }
    });
  }

  /**
   * Function to allow automatic expansion of the current user in the users table
   * @author CptVickers
   */
  @ViewChild('userTableElement') elements: ElementRef;
  protected expand_user_table_row(): void {
    // Set the expanded user row to the user that is currently logged in.
    this.user_table_expanded_element = this.auth_service.current_user_name;
  }

  /**
   * This function requests users from the server based on the role of the logged in user.
   * If a user is student, only the student will be retrieved. For teachers, all students will
   * be retrieved in addition to themselves. Administrators will receive all users.
   * @author Ycreak
   */
  private request_users() {
    this.api.spinner_on();
    // We will provide the api with the currently logged in user to check its privileges
    const user = new User({
      username: this.auth_service.current_user_name,
      role: this.auth_service.current_user_role,
    });
    this.api.get_users(user).subscribe({
      next: (data) => {
        this.retrieved_users = data;
        //FIXME: this should be handled somewhere else, preferably by a listener
        // Rebuild the table that displays the users
        this.user_table_users = new MatTableDataSource(this.retrieved_users);
        this.user_table_users.paginator = this.paginator;
        this.user_table_users.sort = this.table_sort;
        this.table_data_loaded = true;
        this.api.spinner_off();
      },
      error: (err) => this.api.handle_error_message(err),
    });
  }

  /**
   * This function requests the API to create a new user given the form. With a username and
   * provided password a new user is requested from the server.
   * @param form_results containing data of the form
   * @author Ycreak
   */
  protected request_create_user(form_results: any) {
    this.api.spinner_on();
    this.dialog
      .open_confirmation_dialog('Are you sure you want to CREATE this user?', form_results.new_user)
      .subscribe((result) => {
        if (result) {
          const user = new User({
            username: form_results.new_user,
            password: form_results.new_password,
          });
          this.api.create_user(user).subscribe({
            next: (res) => {
              this.api.handle_error_message(res), this.request_users();
            },
            error: (err) => this.api.handle_error_message(err),
          });
        }
      });
  }

  /**
   * This function requests the changing of the role of a user.
   * @param user object of the user who's role is to change
   * @param role new role to be given to the user
   * @author Ycreak
   */
  protected request_change_role(user: any) {
    const item_string = user.username + ', ' + user.role;
    this.dialog
      .open_confirmation_dialog('Are you sure you want to CHANGE the role of this user?', item_string)
      .subscribe((result) => {
        if (result) {
          this.api.spinner_on();
          // We update the user role by providing the api with a username and the new role
          this.api.user_update({ username: user.username, role: user.role }).subscribe({
            next: (res) => {
              this.api.handle_error_message(res), this.request_users();
            },
            error: (err) => this.api.handle_error_message(err),
          });
        }
      });
  }

  /**
   * This function requests the changing of the selected user's password. If the dialog is succesful,
   * communication with the server is started. If the passwords do not match, the snackbar is invoked.
   * @param form change_password form with new passwords
   * @param username of the currently selected user in the table
   * @author Ycreak
   */
  protected request_change_password(form: FormGroup, username: string): void {
    if (form.value.password1 == form.value.password2) {
      this.dialog
        .open_confirmation_dialog("Are you sure you want to CHANGE this user's password", username)
        .subscribe((result) => {
          if (result) {
            this.api.spinner_on();
            this.api.user_update({ username: username, password: form.value.password1 }).subscribe({
              next: (res) => this.api.handle_error_message(res),
              error: (err) => this.api.handle_error_message(err),
            });
          }
        });
    } else {
      this.utility.open_snackbar('Passwords do not match.');
    }
  }

  /**
   * This function requests the api to delete a user given their username
   * @param username name of the user who's account is to be deleted
   * @author Ycreak
   */
  protected request_delete_user(user: any): void {
    this.dialog
      .open_confirmation_dialog('Are you sure you want to DELETE this user?', user.username)
      .subscribe((result) => {
        if (result) {
          this.api.spinner_on();
          this.api.delete_user(user).subscribe({
            next: (res) => {
              this.api.handle_error_message(res), this.request_users();
            },
            error: (err) => this.api.handle_error_message(err),
          });
        }
      });
  }
}
