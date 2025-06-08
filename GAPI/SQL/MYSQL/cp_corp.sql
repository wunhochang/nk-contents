-- [GetList]
select
	data.*,
	fn_get_common_type_data('USE_YN', data.use_yn) as use_yn_name,
	fn_get_user_name_by_no(data.insert_user_no) as insert_user_no_name,
	fn_get_user_name_by_no(data.update_user_no) as update_user_no_name
from (
select 
	  a.cp_corp_no   
	, a.cp_corp_name  
	, a.biz_operator_name 
	, a.biz_operator_no  
	, a.representative_name 
	, a.biz_operator_address 
	, a.tax_email  
	, a.use_yn   
	, a.insert_user_no  
	--, DATE_FORMAT(a.insert_date, "%Y-%m-%d %H:%i:%s") as insert_date
	, a.insert_date
	, a.update_user_no  
	--, DATE_FORMAT(a.update_date, "%Y-%m-%d %H:%i:%s") as update_date
	, a.update_date
	, b.cp_corp_detail_no
	, b.cp_corp_detail_name
	, b.total_sales
	, b.nk_sales
	, b.nk_contract_rate
	, b.cp_contract_rate
	, b.contract_st_date
	, b.contract_ed_date
	, b.extend_condition
	, b.cp_corp_user_email
	, (select count(*) from cp_corp a left join cp_corp_detail b 
		on a.cp_corp_no = b.cp_corp_no
			and b.use_yn = 'Y'
			and b.del_yn = 'N'
		where 1=1 and a.del_yn = 'N' {IN_STR}) as total_count
from cp_corp a left join cp_corp_detail b
on a.cp_corp_no = b.cp_corp_no
  and b.use_yn = 'Y'
  and b.del_yn = 'N'
where 1=1
  and a.del_yn = 'N'
    {IN_STR}
) data
{IN_ORDER_BY}
{IN_LIMIT}
;

-- [GetReportComboList]
select
	  common_code_no report_no
	, type_data report_name
from common_code
where 1=1 and del_yn = 'N' and use_yn = 'Y' and type_name='REPORT_TYPE'
order by output_order asc
;

-- [GetComboList]
select
  a.cp_corp_no   
, a.cp_corp_name  
, a.biz_operator_name 
, a.biz_operator_no  
, a.representative_name 
, a.biz_operator_address 
, a.tax_email  
from cp_corp a 
where 1=1 and a.del_yn = 'N' and a.use_yn = 'Y'
order by cp_corp_name asc
;

-- [Insert]
insert into cp_corp(
	  cp_corp_no
	, cp_corp_name
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
	  :cp_corp_no
	, :cp_corp_name
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
update cp_corp set
	  cp_corp_name			= :cp_corp_name              
	, biz_operator_name		= :biz_operator_name         
	, biz_operator_no		= :biz_operator_no           
	, representative_name	= :representative_name       
	, biz_operator_address	= :biz_operator_address      
	, tax_email				= :tax_email 
	, use_yn				= :use_yn                    
	, update_user_no		= :oper_user_no          
	, update_date			= current_timestamp            
where cp_corp_no = :cp_corp_no
;

-- [Delete]
update cp_corp set
	  use_yn		= 'N'     
	, del_yn		= 'Y'         
	, delete_user_no	= :oper_user_no     
	, delete_date		= current_timestamp 
where cp_corp_no = :cp_corp_no
;