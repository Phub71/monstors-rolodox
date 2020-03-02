import React from 'react';
import './card.styles.css';

// the id there can be used to a unique monster and the size the manually specified of the image


export const Card = props => {
    return(
  <div className="card-container">
      <img alt="monster" src={`https://robohash.org/${props.singleMonster.id}?set=set2&size=200x180`}/>
    <h2>{props.singleMonster.name}</h2>
    <p>{props.singleMonster.email}</p>
    <p>{props.singleMonster.phone}</p>
  </div>);
};
