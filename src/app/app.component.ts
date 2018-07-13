import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase';
import { AngularFireDatabase } from 'angularfire2/database';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'nla-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {

  user: Observable<firebase.User>;
  currentUser: firebase.User;
  notes: Observable<any>;

  currentTitle: string;
  currentDescription: string;

  notes_list = [];
  form: FormGroup;

  constructor(public afAuth: AngularFireAuth, public db: AngularFireDatabase) {}

  ngOnInit() {
    this.form = new FormGroup({
      'email': new FormControl(null, [Validators.required, Validators.email]),
      'password': new FormControl(null, [Validators.required, Validators.minLength(6)])
    });

    this.user = this.afAuth.authState;
    this.user.subscribe((user: firebase.User) => {
      this.currentUser = user;

      if (user) {
        this.form.reset();
        this.notes = this.db.object(`/user-notes-list/${user.uid}/`).snapshotChanges();
        this.notes.subscribe(el => {
          this.notes_list = [];
          el.payload.forEach(item => {
            const noteData = {
              'key': item.key,
              'value': item.val()};
            const estimate = this.dateEstimate(new Date(), new Date(Date.parse(noteData.value.creationDate)));
            noteData.value.estimate = `${estimate.count} ${estimate.view}`;
            noteData.value.localDate = new Date(Date.parse(noteData.value.creationDate)).toLocaleString();
            this.notes_list.push(noteData);
          });
        });
      } else {
        this.notes_list = [];
      }
    });
  }

  signIn() {
    const formData = this.form.value;

    this.afAuth.auth.signInWithEmailAndPassword(formData.email, formData.password)
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode === 'auth/weak-password') {
          alert('The password is too weak.');
        } else {
          alert(errorMessage);
        }
      });
  }

  signUp() {
    const formData = this.form.value;

    this.afAuth.auth.createUserWithEmailAndPassword(formData.email, formData.password)
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode === 'auth/weak-password') {
          alert('The password is too weak.');
        } else {
          alert(errorMessage);
        }
      });
  }
  signOut() {
    this.afAuth.auth.signOut();
  }

  addNewNote(title, description) {
    if (!this.currentUser) {
      return;
   }

    const postData = {
      uid: this.currentUser.uid,
      creationDate: new Date(),
      title: title,
      discription: description
    };

    const newNoteKey = this.db.database.ref().child('notes-list').push().key;

    const updates = {};
    updates['/notes-list/' + newNoteKey] = postData;
    updates['/user-notes-list/' + postData.uid + '/' + newNoteKey] = postData;

    this.db.database.ref().update(updates);
  }

  updateNote(event) {

    if (!this.currentUser) {
      return;
    }
    const key = event.target.attributes['for'].value;
    const postData = this.notes_list.filter(item => item.key === key)[0].value;

    if (this.currentTitle) {
      postData.title = this.currentTitle;
    }

    if (this.currentDescription) {
      postData.discription = this.currentDescription;
    }

    const updates = {};
    updates['/notes-list/' + key] = postData;
    updates['/user-notes-list/' + postData.uid + '/' + key] = postData;

    this.db.database.ref().update(updates);
    this.currentTitle = '';
    this.currentDescription = '';
  }

  removeNote(key) {
    if (!this.currentUser) {
      return;
    }
    const deletes = {};
    deletes['/notes-list/' + key] = null;
    deletes['/user-notes-list/' + this.currentUser.uid + '/' + key] = null;
    this.db.database.ref().update(deletes);
  }

  dateEstimate(date1, date2) {
    const diff = date1 - date2;
    const timeSeconds = {
      y: {ms: 31536000000, view: ['год', 'года', 'лет']},
      mon: {ms: 2592000000, view: ['месяц', 'месяца', 'месяцев']},
      w: {ms: 604800000, view: ['неделя', 'недель', 'неделей']},
      d: {ms: 86400000, view: ['день', 'дня', 'дней']},
      h: {ms: 3600000, view: ['час', 'часа', 'часов']},
      m: {ms: 60000, view: ['мунута', 'минуты', 'минут']},
      s: {ms: 1000, view: ['сукунда', 'секунды', 'секунд']} };

    let datepart = 'y';
    for (let key of Object.keys(timeSeconds)) {
      if (diff < 1000) {
        datepart = 's';
        break;
      }
      if (diff > timeSeconds[key].ms && diff < timeSeconds[datepart].ms) {
        datepart = key;
      }
    }
    const checkNumber = (number) => {
      const b = (number % 10);
      const a = (number % 100 - b) / 10;

      if (a === 0 || a >= 2) {
        if (b === 0 || (b > 4 && b <= 9)) {
          return 2;
        } else {
          if (b !== 1) {
            return 1;
          } else {
            return 0;
          }
        }
      } else {
        return 2;
      }
    };
    const count = Math.floor( diff / timeSeconds[datepart].ms);
    return { count: count, view: timeSeconds[datepart].view[checkNumber(count)] };

  }
}
