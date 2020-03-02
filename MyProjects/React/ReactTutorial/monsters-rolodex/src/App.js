import React, { Component } from 'react';
import { CardList } from './components/cardList/card-list.component';
import './App.css';
import { SearchBox } from './components/search-box/search-box.component';

class App extends Component {
  constructor() {
    super();

    this.state = {
      monsters: [],
      searchFilter: ''
    };
   // this.handleChange = this.handleChange.bind(this); 
   // if we use an arrow function instead of a normal function, we don't need to bind it in the constructor  }
  }
  componentDidMount() {
    fetch('https://jsonplaceholder.typicode.com/users')
      .then(response => response.json()) // take the response into the json format
      .then(users => this.setState({ monsters: users }));
  }

  // if we use an arrow function instead of a normal function, we don't need to bind it in the constructor
  handleChange = (e) => {
    this.setState({ searchFilter: e.target.value });
  }

  // setState is a asynchros function and that is why it is always one step behind, to make it synchronos and be
  // able to update the state at the same time, we use a callback function at the end
  render() {
    const { monsters, searchFilter } = this.state;
    const filteredMonsters = monsters.filter(monster => {
      return monster.name.toLowerCase().includes(searchFilter.toLowerCase());
    });

    return (
      <div className='App'>
        <h1> Monsters Rolodex</h1>
        <SearchBox
          placeholder='Search monster'
          handleChange={this.handleChange}
        />
        <CardList monsters={filteredMonsters} />
      </div>
    );
  }
}
export default App;
