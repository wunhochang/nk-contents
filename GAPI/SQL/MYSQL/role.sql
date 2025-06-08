-- [GetList]
select
	data.*,
	fn_get_common_type_data('USE_YN', data.use_yn) as use_yn_name,
	fn_get_user_name_by_no(data.insert_user_no) as insert_user_no_name,
	fn_get_user_name_by_no(data.update_user_no) as update_user_no_name
from (
select 
	  role_no
	, role_name
	, role_code
	, role_desc
	, (case when admin_flag = 'Y' then true else false end) as admin_flag
	, output_order
	, use_yn
	, insert_user_no
	, insert_date
	, update_user_no
	, update_date
	, (select count(*) from role where 1=1 and del_yn='N' {IN_STR}) as total_count
from role
where 1=1 and del_yn = 'N'
    {IN_STR}
) data
{IN_ORDER_BY}
{IN_LIMIT}
;

-- [GetComboList]
select
	  role_no
	, role_name
	, role_code
	, role_desc
	, admin_flag
from role
where 1=1 and del_yn = 'N' and use_yn = 'Y'
order by output_order asc, role_name asc
;

-- [Insert]
insert into role(
	  role_no
	, role_name
	, role_code
	, role_desc
	, admin_flag
	, output_order
	, use_yn
	, insert_user_no
	, insert_date
	, update_user_no
	, update_date
)
values(
	  :role_no
	, :role_name
	, :role_code
	, :role_desc
	, :admin_flag
	, :output_order
	, :use_yn
	, :oper_user_no
	, current_timestamp
	, :oper_user_no
	, current_timestamp
);

-- [Update]
update role set
	  role_name	= :role_name         
	, role_code	= :role_code         
	, role_desc	= :role_desc         
	, admin_flag	= :admin_flag        
	, output_order	= :output_order      
	, use_yn	= :use_yn            
	, update_user_no= :oper_user_no      
	, update_date	= :current_timestamp  
where role_no = :role_no
;

-- [Delete]
update role set
	  use_yn		= 'N'     
	, del_yn		= 'Y'         
	, delete_user_no	= :oper_user_no     
	, delete_date		= current_timestamp 
where role_no = :role_no
;