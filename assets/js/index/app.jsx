import React, {Component, PureComponent} from 'react';
import PropTypes from 'prop-types';
import '../../scss/index/styles.scss';

class User extends PureComponent {
  static propTypes = {
    user: PropTypes.object.isRequired
  };

  render() {
    return (
      <div className='user'>
        <span>{this.props.user.name}</span>
      </div>
    );
  }
}

export default class App extends Component {
  static propTypes = {
    users: PropTypes.array
  };

  static defaultProps = {
    users: []
  };

  render() {
    return (<div className='index'>
        {this.props.users.map(user => <User key={user.id} user={user}/>)}
      </div>
    );
  }
}