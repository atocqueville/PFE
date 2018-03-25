import React from "react";
import './history.css';

function TradeList(props) {
  const history = props.history;
  const listTrade = history.map(function (trade, i) {
      return (
        <p key={i}>{trade.type} {trade.amount} {trade.crypto} à {trade.value}$ le {trade.date}</p>
      )
    }
  );
  return (
    <div className="card-body">{listTrade}</div>
  );
}

const History = (props) => {
  return (
    <div className="card border-secondary mb-3">
      <h5 className="card-header">Last transactions</h5>
      <TradeList history={props.history}/>
    </div>
  )
};

export default History;