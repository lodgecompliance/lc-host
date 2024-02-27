import Model from '../../../Foundation/Model';

export default class Charge extends Model{
    fillables = [
        'title', 'description', 'type',  'enable', 'amount', 'optional', 'currency'
    ]

    constructor(model = null){
       super(model);
       return this.init();
    }
}