-- [GetList]
select
	data.*,
	fn_get_user_name_by_no(data.insert_user_no) as insert_user_no_name,
	fn_get_user_name_by_no(data.update_user_no) as update_user_no_name
from (
select 
	   mail_send_log_no
	, to_email
	, cc_email
	, mail_title
    , send_date
	, remark
    , settlement_month
    , attach_file
	, insert_user_no
	, insert_date
	, update_user_no
	, update_date
	, (select count(*) from mail_send_log a  where 1=1 and a.del_yn='N' and DATE_FORMAT(a.send_date, '%Y-%m-%d')  >=  DATE_FORMAT(:st_date, '%Y-%m-%d') and DATE_FORMAT(a.send_date, '%Y-%m-%d')<=DATE_FORMAT(:end_date, '%Y-%m-%d') {IN_STR}) as total_count
    from mail_send_log a 
    where 1=1 and a.del_yn = 'N'  and DATE_FORMAT(a.send_date, '%Y-%m-%d') >=  DATE_FORMAT(:st_date, '%Y-%m-%d') and DATE_FORMAT(a.send_date, '%Y-%m-%d')<=DATE_FORMAT(:end_date, '%Y-%m-%d')
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

-- [Delete]
update role set
	  use_yn		= 'N'     
	, del_yn		= 'Y'         
	, delete_user_no	= :oper_user_no     
	, delete_date		= current_timestamp 
where role_no = :role_no
;