-- [GetList]
select 
	  sp_corp_detail_no
	, sp_corp_no
	, sp_corp_detail_name
	, sales_kind
	, sales_kind_name
	, contact_type
	, contact_type_name
	, general_rate
	, premium_rate
	, first_open_rate
	, new_open_rate
	, old_open_rate
	, double_feature_rate
	, pink_rate
	, agency_rate
	, output_order
	, use_yn
	, insert_user_no
	, insert_date
	, update_user_no
	, update_date
from sp_corp_detail
where 1=1 
	and del_yn = 'N' 
	and sp_corp_no = :sp_corp_no
order by output_order asc, sp_corp_detail_name asc
;

-- [GetComboList]
select 
  a.sp_corp_detail_no
, a.sp_corp_no
, a.sp_corp_detail_name
, concat(a.sp_corp_detail_name, ' (', b.sp_corp_name, ')') as full_sp_corp_detail_name
, a.sales_kind
, a.sales_kind_name
, a.contact_type
, a.contact_type_name
, a.general_rate
, a.premium_rate
, a.first_open_rate
, a.new_open_rate
, a.old_open_rate
, a.double_feature_rate
, b.sp_corp_name
from sp_corp_detail a 
inner join sp_corp b 
on b.sp_corp_no = a.sp_corp_no
  and b.use_yn = 'Y'
  and b.del_yn = 'N'
where a.use_yn = 'Y'
  and a.del_yn = 'N'
order by a.sp_corp_detail_name asc;

-- [Insert]
insert into sp_corp_detail(
	  sp_corp_detail_no
	, sp_corp_no
	, sp_corp_detail_name
	, sales_kind
	, sales_kind_name
	, contact_type
	, contact_type_name
	, general_rate
	, premium_rate
	, first_open_rate
	, new_open_rate
	, old_open_rate
	, double_feature_rate
	, pink_rate
	, agency_rate
	, output_order
	, use_yn
	, insert_user_no
	, insert_date
	, update_user_no
	, update_date
)
values(
	  :sp_corp_detail_no
	, :sp_corp_no
	, :sp_corp_detail_name
	, :sales_kind
	, :sales_kind_name
	, :contact_type
	, :contact_type_name
	, :general_rate
	, :premium_rate
	, :first_open_rate
	, :new_open_rate
	, :old_open_rate
	, :double_feature_rate
	, :pink_rate
	, :agency_rate
	, :output_order
	, :use_yn
	, :oper_user_no
	, current_timestamp
	, :oper_user_no
	, current_timestamp
);

-- [Update]
update sp_corp_detail set
	  sp_corp_no		= :sp_corp_no     
	, sp_corp_detail_name = :sp_corp_detail_name
	, sales_kind		= :sales_kind
	, sales_kind_name	= :sales_kind_name
	, contact_type		= :contact_type  
	, contact_type_name	= :contact_type_name
	, general_rate		= :general_rate            
	, premium_rate		= :premium_rate            
	, first_open_rate	= :first_open_rate         
	, new_open_rate		= :new_open_rate           
	, old_open_rate		= :old_open_rate           
	, double_feature_rate	= :double_feature_rate     
	, pink_rate		= :pink_rate               
	, agency_rate		= :agency_rate             
	, output_order		= :output_order            
	, use_yn		= :use_yn                  
	, update_user_no	= :oper_user_no            
	, update_date		= current_timestamp 
where sp_corp_detail_no = :sp_corp_detail_no
;

-- [Delete]
update sp_corp_detail set
	  use_yn		= 'N'     
	, del_yn		= 'Y'         
	, delete_user_no	= :oper_user_no     
	, delete_date		= current_timestamp 
where sp_corp_detail_no = :sp_corp_detail_no
;