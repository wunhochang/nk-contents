export default Ext.define('Genone.model.CommonCodeViewModel', {
  extend: 'Ext.data.Model',
  fields: [
    { name: 'common_code_no', type:'number' },
    { name: 'type_name', type:'string' },
    { name: 'type_code', type:'string' },
    { name: 'type_data', type:'string' },
    { name: 'remark', type:'string' },
    { name: 'parent_type_name', type:'string' },
    { name: 'parent_type_code', type:'string' },
    { name: 'option_data', type:'string' },
    { name: 'output_order', type:'number', defaultValue:1 },
    { name: 'use_yn', type:'string', defaultValue:'Y' },
    { name: 'use_yn_name', type:'string' },
    { name: 'insert_date', type: 'date', dateFormat: 'Y-m-d H:i:s' },
    { name: 'insert_user_no', type:'string' },
    { name: 'insert_user_no_name', type:'string' },
    { name: 'updaet_date', type: 'date', dateFormat: 'Y-m-d H:i:s' },
    { name: 'updaet_user_no', type:'string' },
    { name: 'updaet_user_no_name', type:'string' },
  ]
});
