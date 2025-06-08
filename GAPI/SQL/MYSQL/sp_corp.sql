-- [GetList]
select
	data.*,
	fn_get_common_type_data('USE_YN', data.use_yn) as use_yn_name,
	fn_get_user_name_by_no(data.insert_user_no) as insert_user_no_name,
	fn_get_user_name_by_no(data.update_user_no) as update_user_no_name,
	FN_GET_SP_CORP_MANAGER_LIST(data.sp_corp_no) as manager_info
from (
select
	  a.sp_corp_no
	, a.sp_corp_name
	, a.biz_operator_name
	, a.biz_operator_no
	, a.representative_name
	, a.biz_operator_address
	, a.tax_email
	, a.use_yn
	, a.insert_user_no
	, a.insert_date
	, a.update_user_no
	, a.update_date
	, b.sp_corp_detail_no
	, b.sp_corp_detail_name
	, b.sales_kind
	, b.sales_kind_name
	, b.contact_type
	, b.contact_type_name
	, b.general_rate
	, b.premium_rate
	, b.first_open_rate
	, b.new_open_rate
	, b.old_open_rate
	, b.double_feature_rate
	, b.pink_rate
	, b.agency_rate
	, b.output_order as output_order1
	, (select count(*) from sp_corp a 
		left join sp_corp_detail b on a.sp_corp_no = b.sp_corp_no and b.use_yn = 'Y' and b.del_yn = 'N'
	  where 1=1 and a.del_yn = 'N' {IN_STR}) as total_count
from sp_corp a left join sp_corp_detail b on a.sp_corp_no = b.sp_corp_no and b.use_yn = 'Y' and b.del_yn = 'N'
where  1=1 and a.del_yn = 'N' 
    {IN_STR}
) data
{IN_ORDER_BY}
{IN_LIMIT}
;

-- [GetList_bak]
select
	data.*,
	fn_get_common_type_data('USE_YN', data.use_yn) as use_yn_name,
	fn_get_user_name_by_no(data.insert_user_no) as insert_user_no_name,
	fn_get_user_name_by_no(data.update_user_no) as update_user_no_name
from (
select
	  a.sp_corp_no
	, a.sp_corp_name
	, a.biz_operator_name
	, a.biz_operator_no
	, a.representative_name
	, a.biz_operator_address
	, a.tax_email
	, a.use_yn
	, a.insert_user_no
	, a.insert_date
	, a.update_user_no
	, a.update_date
	, b.sp_corp_detail_name
	, b.sales_kind
	, b.contact_type
	, b.general_rate
	, b.premium_rate
	, b.first_open_rate
	, b.new_open_rate
	, b.old_open_rate
	, b.double_feature_rate
	, b.pink_rate
	, b.agency_rate
	, b.output_order as output_order1
	, c.sp_corp_manager_no
	, c.sp_corp_manager_name
	, c.sp_corp_manager_position
	, c.sp_corp_manager_tel1
	, c.sp_corp_manager_tel2
	, c.sp_corp_manager_email
	, c.output_order as output_order2
	, (select count(*) from sp_corp a 
		left join sp_corp_detail b on a.sp_corp_no = b.sp_corp_no and b.use_yn = 'Y' and b.del_yn = 'N'
		left join sp_corp_manager c on a.sp_corp_no = c.sp_corp_no and c.use_yn = 'Y' and c.del_yn = 'N'
	  where 1=1 and a.del_yn = 'N' {IN_STR}) as total_count
from sp_corp a left join sp_corp_detail b on a.sp_corp_no = b.sp_corp_no and b.use_yn = 'Y' and b.del_yn = 'N'
left join sp_corp_manager c on a.sp_corp_no = c.sp_corp_no and c.use_yn = 'Y' and c.del_yn = 'N'
where  1=1 and a.del_yn = 'N' 
    {IN_STR}
) data
{IN_ORDER_BY}
{IN_LIMIT}
;

-- [GetReportComboList]
select
	  common_code_no cp_corp_no
	, type_data cp_corp_name
from common_code
where 1=1 and del_yn = 'N' and use_yn = 'Y' and type_name='REPORT_TYPE'
order by output_order asc
;


-- [GetComboList]
select
	  sp_corp_no
	, sp_corp_name
	, biz_operator_name
	, biz_operator_no
	, representative_name
	, biz_operator_address
	, tax_email
	, use_yn 
from sp_corp
where 1=1 and del_yn = 'N' and use_yn = 'Y'
order by sp_corp_name asc
;

-- [Insert]
insert into sp_corp(
	  sp_corp_no
	, sp_corp_name
	, biz_operator_name
	, biz_operator_no
	, representative_name
	, biz_operator_address
	, tax_email
	, use_yn
	, insert_user_no
	, insert_date
	, update_user_no
	, update_date
)
values(
	  :sp_corp_no
	, :sp_corp_name
	, :biz_operator_name
	, :biz_operator_no
	, :representative_name
	, :biz_operator_address
	, :tax_email
	, :use_yn
	, :oper_user_no
	, current_timestamp
	, :oper_user_no
	, current_timestamp
);

-- [Update]
update sp_corp set
	  sp_corp_name		= :sp_corp_name          
	, biz_operator_name	= :biz_operator_name     
	, biz_operator_no	= :biz_operator_no       
	, representative_name	= :representative_name   
	, biz_operator_address	= :biz_operator_address  
	, tax_email		= :tax_email             
	, use_yn		= :use_yn                
	, update_user_no	= :oper_user_no          
	, update_date		= current_timestamp           
where sp_corp_no = :sp_corp_no
;

-- [Delete]
update sp_corp set
	  use_yn		= 'N'     
	, del_yn		= 'Y'         
	, delete_user_no	= :oper_user_no     
	, delete_date		= current_timestamp 
where sp_corp_no = :sp_corp_no
;