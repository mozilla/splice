import React from 'react';
import { Link, History } from 'react-router';

export default React.createClass({
  mixins: [History],
  render: function() {
    return (<nav>
      {this.props.items.map(item => {
        return (<Link to={item.link}
          key={item.label}
          className={this.history.isActive(item.link) ? 'active' : ''}>
          <span className={`fa ${item.icon}`} />
          <span className="icon-label">{item.label}</span>
        </Link>);
      })}
    </nav>);
  }
});
