import expect from 'expect';
import * as actions from '../../src/actions/TodosAction';
import * as types from '../../src/constants/ActionTypes';

describe('actions', () => {
	it('should create an action to add a todo', () => {
		const text = 'Finish docs';
		const expectedAction = {
			type: types.ADD_TODO,
			payload: {
				text: text,
				completed: false
			}
		};
		expect(actions.addTodo(text)).toEqual(expectedAction);
	});
});