import React, { Component } from "react";
import firebase from "./firebase";
import Login from "./Login";
import Dashboard from "./Dashboard";
import AddExercises from "./AddExercises";
import Workouts from "./Workouts";
import Exercises from "./Exercises";
import WorkoutView from "./WorkoutView";
import Notes from "./Notes";
import Logs from "./Logs";
import { Route, Switch, Redirect, withRouter } from "react-router-dom";

const provider = new firebase.auth.GoogleAuthProvider();
const auth = firebase.auth();

// PURPOSE OF MASTER :
// handle loging in and out
// rendering routes

class Master extends Component {
  constructor() {
    super();
    this.state = {
      user: null,
      routineCounter: 0,
      exerciseCounter: 1,
      workoutCounter: 0,
      exerciseCollection: [],
      workoutCollection: [],
      workoutKeys: [],
      exerciseKeys: []
    };
  }

  componentDidMount() {
    auth.onAuthStateChanged(user => {
      if (user) {
        this.setState(
          {
            user: user
          },
          () => {
            // create reference specific to user
            this.dbRef = firebase.database().ref(`/${this.state.user.uid}`);
            this.dbRef.on("value", snapshot => {
              this.setState({
                userData: snapshot.val() || {}
              });
            });
          }
        );
      }
    });
  }

  componentWillUnmount() {
    if (this.dbRef) {
      this.dbRef.off();
    }
  }
  // LOGIN FUNCTIONS

  logIn = () => {
    auth.signInWithPopup(provider).then(result => {
      this.setState({
        user: result.user,
        uid: result.user.uid
      });
    });
  };

  logOut = () => {
    auth.signOut().then(() => {
      this.setState({
        user: null
      });
    });
  };

  // CONTROLLED INPUTS

  handleChange = e => {
    this.setState({
      ...this.state,
      [e.target.id]: e.target.value
    });
  };

  // ADD ROUTINE

  addRoutine = e => {
    e.preventDefault();
    // new routine object (Cutting Season)
    const newRoutine = {
      routineName: this.state.routineName
    };

    // ROUTINE KEY + PUSH TO FB (uid/routine/)
    const routineKey = this.dbRef.push(newRoutine).key;

    this.setState({
      routineKey
    });

    // Re-direct
    this.props.history.push(`/workouts/`);
  };

  // ADD WORKOUT

  addWorkout = e => {
    e.preventDefault();

    // ROUTINE KEY (from add workout form)

    // new workout object (Monday)
    const newWorkout = {
      workoutName: this.state.workoutName
    };
    // create a copy of the workoutCollection array
    const updatedWorkoutCollection = Array.from(this.state.workoutCollection);
    // push new workout to the updatedworkout array
    updatedWorkoutCollection.push(newWorkout);

    // WORKOUT KEY + PUSH TO FB (uid/routine/workout)
    const workoutKey = firebase
      .database()
      .ref(`/${this.state.user.uid}/${this.state.routineKey}`)
      .push(newWorkout).key;

    const updatedWorkoutKeys = Array.from(this.state.workoutKeys);
    updatedWorkoutKeys.push({
      [this.state.workoutName]: workoutKey
    });

    // counter appends workout form (Monday) to page
    // set the state of the workoutCollection to the updated workoutCollection array
    this.setState({
      workoutCounter: this.state.workoutCounter + 1,
      workoutCollection: updatedWorkoutCollection,
      workoutKey: workoutKey,
      workoutKeys: updatedWorkoutKeys
    });

    // re-direct
    this.props.history.push(`/addexercises/`);
  };

  // ADD EXERCISE

  addExercise = e => {
    e.preventDefault();

    const newExercise = {
      exerciseName: this.state.exerciseName,
      exerciseSets: this.state.exerciseSets,
      exerciseReps: this.state.exerciseReps
    };

    // copy of exercise array
    const updatedExerciseCollection = Array.from(this.state.exerciseCollection);

    // push new exercise object to copy of exercise array
    updatedExerciseCollection.push(newExercise);

    // set exercise array copy to state
    // counter appends exercise form (bicep curls) to page
    this.setState({
      exerciseCounter: this.state.exerciseCounter + 1,
      exerciseCollection: updatedExerciseCollection
    });
  };

  // SAVE WORKOUT

  saveWorkout = e => {
    e.preventDefault();

    // creating copy of exerciseKey array
    const updatedExerciseKeys = Array.from(this.state.exerciseKeys);

    // map over our exercices collection and send individual exercise objects to FB
    // getting individual exercise keys
    this.state.exerciseCollection.map(exercise => {
      const exerciseKey = firebase
        .database()
        .ref(
          `/${this.state.user.uid}/${this.state.routineKey}/${
            this.state.workoutKey
          }`
        )
        .push(exercise).key;
      // pushing each exercise object into cloned exerciseKey array
      updatedExerciseKeys.push({ [exercise.exerciseName]: exerciseKey });
    });

    const newExercise = {
      exerciseName: this.state.exerciseName,
      exerciseSets: this.state.exerciseSets,
      exerciseReps: this.state.exerciseReps
    };

    // pushing last exercise (held in state) to FB, and getting key
    const lastExerciseKey = firebase
      .database()
      .ref(
        `/${this.state.user.uid}/${this.state.routineKey}/${
          this.state.workoutKey
        }`
      )
      .push(newExercise).key;
    // pushing last key into cloned exerciseKeys array
    updatedExerciseKeys.push({ [this.state.exerciseName]: lastExerciseKey });

    // Re-direct back to user's routine/workout list.
    this.props.history.push(`/workouts/`);

    // resetting exercise counter, exercise collection
    // setting exerciseKeys to cloned version
    this.setState({
      exerciseCounter: 1,
      exerciseCollection: [],
      exerciseKeys: updatedExerciseKeys
    });
  };

  saveRoutine = () => {
    // saving routine function
    // Direct user to Dashboard
    this.props.history.push(`/dashboard/`);

    // Update routine counter +1
    this.setState({
      routineCounter: this.state.routineCounter + 1,
      workoutCollection: [],
      workoutKeys: []
    });

    // Key attached to routine
  };

  goToRoutine = e => {
    const routineKeyForWorkoutView = e.target.id;
    this.setState({
      routineKeyForWorkoutView
    });
    this.props.history.push(`/workoutview`);
  };

  render() {
    return (
      <Switch>
        <Route
          exact
          path="/"
          render={() =>
            !this.state.user ? (
              <Login logIn={this.logIn} logOut={this.logOut} />
            ) : (
              <Redirect to="/dashboard" />
            )
          }
        />
        <Route
          exact
          path="/dashboard"
          render={() => (
            <Dashboard
              addRoutine={this.addRoutine}
              handleChange={this.handleChange}
              routineCounter={this.state.routineCounter}
              userData={this.state.userData}
              goToRoutine={this.goToRoutine}
            />
          )}
        />
        <Route
          path="/workouts/"
          render={() => (
            <Workouts
              handleChange={this.handleChange}
              addWorkout={this.addWorkout}
              workoutCounter={this.state.workoutCounter}
              routineName={this.state.routineName}
              workoutName={this.state.workoutName}
              workoutCollection={this.state.workoutCollection}
              workoutKeys={this.state.workoutKeys}
              saveRoutine={this.saveRoutine}
            />
          )}
        />
        <Route
          path="/addexercises/"
          render={() => (
            <AddExercises
              handleChange={this.handleChange}
              saveWorkout={this.saveWorkout}
              addExercise={this.addExercise}
              exerciseCounter={this.state.exerciseCounter}
              workoutName={this.state.workoutName}
            />
          )}
        />

        <Route
          path="/workoutview"
          render={() => (
            <WorkoutView
              userData={this.state.userData}
              routineKeyForWorkoutView={this.state.routineKeyForWorkoutView}
            />
          )}
        />
        <Route path="/exercises" render={() => <Exercises />} />
        <Route path="/notes" render={() => <Notes />} />
        <Route path="/logs" render={() => <Logs />} />
      </Switch>
    );
  }
}

export default withRouter(Master);
