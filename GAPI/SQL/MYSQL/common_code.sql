-- [GetList]
select
	data.*,
	fn_get_common_type_data('USE_YN', data.use_yn) as use_yn_name,
	fn_get_user_name_by_no(data.insert_user_no) as insert_user_no_name,
	fn_get_user_name_by_no(data.update_user_no) as update_user_no_name
from (
select 
	  common_code_no
	, type_name
	, type_code
	, type_data
	, remark
	, parent_type_name
	, parent_type_code
	, option_data
	, use_yn
	, del_yn
	, output_order
	, insert_user_no
	, insert_date
	, update_user_no
	, update_date
	, (select count(*) from common_code where 1=1 and del_yn='N' {IN_STR}) as total_count
from common_code
where 1=1 and del_yn = 'N'
    {IN_STR}
) data
{IN_ORDER_BY}
{IN_LIMIT}
;

-- [GetComboList]
select
	  common_code_no
	, type_name
	, type_code
	, type_data
from common_code
where 1=1 and del_yn = 'N' and use_yn = 'Y'
	and type_name = :type_name
order by output_order asc, type_data asc
;

-- [Insert]
insert into common_code(
	  common_code_no
	, type_name
	, type_code
	, type_data
	, remark
	, parent_type_name
	, parent_type_code
	, option_data
	, use_yn
	, output_order
	, insert_user_no
	, insert_date
	, update_user_no
	, update_date
)
values(
	  :common_code_no
	, :type_name
	, :type_code
	, :type_data
	, :remark
	, :parent_type_name
	, :parent_type_code
	, :option_data
	, :use_yn
	, :output_order
	, :oper_user_no
	, current_timestamp
	, :oper_user_no
	, current_timestamp
);

-- [Update]
update common_code set
	  type_name		= :type_name        
	, type_code		= :type_code        
	, type_data		= :type_data        
	, remark		= :remark           
	, parent_type_name	= :parent_type_name 
	, parent_type_code	= :parent_type_code 
	, option_data		= :option_data      
	, use_yn		= :use_yn           
	, output_order		= :output_order     
	, update_user_no	= :oper_user_no     
	, update_date		= current_timestamp 
where common_code_no = :common_code_no
;

-- [Delete]
update common_code set
	  use_yn		= 'N'     
	, del_yn		= 'Y'         
	, delete_user_no	= :oper_user_no     
	, delete_date		= current_timestamp 
where common_code_no = :common_code_no
;