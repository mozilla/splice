import React, { Component, PropTypes } from 'react';
import AccountRow from './AccountRow';
import {bindTableResize, tableResize, unbindTableResize} from 'helpers/TableHelpers';

window.$ = require('jquery');
window.jQuery = $;

export default class AccountList extends Component {
  componentDidMount(){
    bindTableResize();
  }

  componentDidUpdate(prevProps){
    if(prevProps.rows !== this.props.rows){
      tableResize();
    }
  }

  componentWillUnmount(){
    unbindTableResize();
  }

  getStatById(accountId){
    let output;
    if(this.props.stats.length > 0){
      for (const row of this.props.stats) {
        if(accountId === row.account_id){
          output = row;
        }
      }
    }
    return output;
  }

  render() {
    let rows;
    let spinner;
    const context = this;

    if (this.props.isFetching === false) {
      rows = this.props.rows.map(function(row, index){
        const stats = context.getStatById(row.id);
        return <AccountRow {...row} {...stats} key={index}/>;
      });
    } else {
      spinner = (<img src={require('../../../public/img/ajax-loader-navy.gif')}/>);
    }

    return (
      <div className="module">
        <div className="module-table data-table">
          <table>
            <thead>
              <tr>
                <th style={{width: '100px', minWidth: '100px'}}>ID</th>
                <th style={{width: '200px', minWidth: '200px'}}>Name</th>
                <th style={{width: '200px', minWidth: '200px'}}>Email</th>
                <th style={{width: '150px', minWidth: '150px'}}>Phone</th>
                <th style={{width: '150px', minWidth: '150px'}}>Created</th>
                <th className="number" style={{width: '100px', minWidth: '100px'}}>Blocked</th>
                <th className="number" style={{width: '100px', minWidth: '100px'}}>Clicked</th>
                <th className="number" style={{width: '100px', minWidth: '100px'}}>Impressions</th>
                <th className="number" style={{width: '100px', minWidth: '100px'}}>Pinned</th>
              </tr>
            </thead>
            <tbody>
              {rows}
            </tbody>
          </table>
        </div>
        {spinner}
      </div>
    );
  }
}

AccountList.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    contact_email: PropTypes.string.isRequired,
    contact_phone: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired
  }).isRequired).isRequired
};
