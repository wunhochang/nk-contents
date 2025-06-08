-- [GetList]
select
	data.*,
	fn_get_common_type_data('USE_YN', data.use_yn) as use_yn_name,
	fn_get_user_name_by_no(data.insert_user_no) as insert_user_no_name,
	fn_get_user_name_by_no(data.update_user_no) as update_user_no_name
from (
select 
	  menu_no
	, menu_code
	, menu_name
	, icon
	, path
	, component
	, option1
	, option2
	, option3
	, parent_menu_no
	, depth
	, remark
	, output_order
	, use_yn
	, insert_date
	, insert_user_no
	, update_date
	, update_user_no
	, (select count(*) from menu where 1=1 and del_yn='N' {IN_STR}) as total_count
from menu
where 1=1 and del_yn = 'N'
    {IN_STR}
) data
{IN_ORDER_BY}
{IN_LIMIT}
;

--[MenuTree_all]
SELECT m.menu_no,
       m.menu_code,
       m.menu_name,
	   m.path,
       m.parent_menu_no,
       m.component,
       m.icon,
       m.depth,
       m.output_order,
       m.use_yn,
       m.del_yn,
       m.insert_user_no,
       m.insert_date,
       m.update_user_no,
       m.update_date,
       /*get_menu_auth(:user_id, m.menu_no) auth*/
	   'R' as auth
from menu m 
where 1 = 1 
  and m.use_yn = 'Y'
  and m.del_yn = 'N'
order by m.depth, m.output_order;


--[MenuTree]
SELECT m.menu_no,
       m.menu_code,
       m.menu_name,
	   m.path,
       m.parent_menu_no,
       m.component,
       m.icon,
       m.depth,
       m.output_order,
       m.use_yn,
       m.del_yn,
       m.insert_user_no,
       m.insert_date,
       m.update_user_no,
       m.update_date,
       /*get_menu_auth(:user_id, m.menu_no) auth*/
	   'R' as auth
from menu m left join role_menu_auth b
on m.menu_no = b.menu_no
left join user c
on b.role_no = c.role_no
where 1 = 1 
  and m.use_yn = 'Y'
  and m.del_yn = 'N'
  and b.auth_type = 'Y'
  and c.user_no = :oper_user_no
  /*and c.user_id = :user_id*/
  and c.use_yn = 'Y'
  and c.del_yn = 'N'
  and c.confirm_yn = 'Y'
order by m.depth, m.output_order;


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
insert into menu(
	  menu_no
	, menu_code
	, menu_name
	, icon
	, path
	, component
	, option1
	, option2
	, option3
	, parent_menu_no
	, depth
	, remark
	, output_order
	, use_yn
	, insert_date
	, insert_user_no
	, update_date
	, update_user_no
)
values(
	  :menu_no
	, :menu_code
	, :menu_name
	, :icon
	, :path
	, :component
	, :option1
	, :option2
	, :option3
	, :parent_menu_no
	, :depth
	, :remark
	, :output_order
	, :use_yn
	, current_timestamp
	, :oper_user_no
	, current_timestamp
	, :oper_user_no
);

-- [Update]
update menu set
	  menu_code			= :menu_code
	, menu_name			= :menu_name
	, icon				= :icon
	, path				= :path
	, component			= :component
	, option1			= :option1
	, option2			= :option2
	, option3			= :option3
	, parent_menu_no	= :parent_menu_no
	, depth				= :depth
	, remark			= :remark
	, output_order		= :output_order
	, use_yn			= :use_yn
	, update_date		= current_timestamp
	, update_user_no	= :oper_user_no
	, update_date		= current_timestamp 
where menu_no = :menu_no
;

-- [Delete]
update menu set
	  use_yn		= 'N'     
	, del_yn		= 'Y'         
	, delete_user_no	= :oper_user_no     
	, delete_date		= current_timestamp 
where menu_no = :menu_no
;