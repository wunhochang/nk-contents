-- [GetList]
select 
	  cp_corp_detail_no
	, cp_corp_no
	, cp_corp_detail_name
	, nk_contract_rate
	, cp_contract_rate
	, nk_sales
	, total_sales
	, cp_corp_user_email
	, DATE_FORMAT(contract_st_date, "%Y-%m-%d") as contract_st_date
	, DATE_FORMAT(contract_ed_date, "%Y-%m-%d") as contract_ed_date
	, extend_condition
	, use_yn
	, output_order
	, insert_user_no
	, insert_date
	, update_user_no
	, update_date
from cp_corp_detail
where 1=1 
	and del_yn = 'N' 
	and cp_corp_no = :cp_corp_no
order by output_order asc, cp_corp_detail_name asc
;




-- [GetComboList]
select 
	  cp_corp_detail_no
	, cp_corp_no
	, cp_corp_detail_name
	, nk_contract_rate
	, cp_contract_rate
	, total_sales
	, nk_sales
from cp_corp_detail
where 1=1 
	and use_yn = 'Y' 
	and del_yn = 'N' 
order by output_order asc, cp_corp_detail_name asc
;

-- [Insert]
insert into cp_corp_detail(
	  cp_corp_detail_no
	, cp_corp_no
	, cp_corp_detail_name
	, total_sales
	, nk_sales
	, nk_contract_rate
	, cp_contract_rate
	, contract_st_date
	, contract_ed_date
	, cp_corp_user_email
	, extend_condition
	, use_yn
	, output_order
	, insert_user_no
	, insert_date
	, update_user_no
	, update_date
)
values(
	  :cp_corp_detail_no
	, :cp_corp_no
	, :cp_corp_detail_name
	, :total_sales
	, :nk_sales
	, :nk_contract_rate
	, :cp_contract_rate
	, :contract_st_date
	, :contract_ed_date
	, :cp_corp_user_email
	, :extend_condition
	, :use_yn
	, :output_order
	, :oper_user_no
	, current_timestamp
	, :oper_user_no
	, current_timestamp
);

-- [Update]
update cp_corp_detail set
	  cp_corp_no			= :cp_corp_no              
	, cp_corp_detail_name	= :cp_corp_detail_name    
	, total_sales			= :total_sales        
	, nk_sales				= :nk_sales      
	, nk_contract_rate		= :nk_contract_rate        
	, cp_contract_rate		= :cp_contract_rate        
	, contract_st_date		= :contract_st_date        
	, contract_ed_date		= :contract_ed_date   
	, cp_corp_user_email	= :cp_corp_user_email      
	, extend_condition		= :extend_condition        
	, use_yn				= :use_yn   
	, output_order			= :output_order
	, update_user_no		= :oper_user_no            
	, update_date			= current_timestamp 
where cp_corp_detail_no = :cp_corp_detail_no
;


-- [PrePayInsert]
insert into cp_corp_detail(
	  cp_corp_detail_no
	, cp_corp_no
	, cp_corp_detail_name
	, total_sales
	, nk_sales
	, nk_contract_rate
	, cp_contract_rate
	, contract_st_date
	, contract_ed_date
	, cp_corp_user_email
	, extend_condition
	, use_yn
	, output_order
	, insert_user_no
	, insert_date
	, update_user_no
	, update_date
)
values(
	  :cp_corp_detail_no
	, :cp_corp_no
	, :cp_corp_detail_name
	, :total_sales
	, :nk_sales
	, :nk_contract_rate
	, :cp_contract_rate
	, :contract_st_date
	, :contract_ed_date
	, :cp_corp_user_email
	, :extend_condition
	, :use_yn
	, :output_order
	, :oper_user_no
	, current_timestamp
	, :oper_user_no
	, current_timestamp
);

-- [PrePayUpdate]
update cp_corp_detail set
	  cp_corp_no			= :cp_corp_no              
	, cp_corp_detail_name	= :cp_corp_detail_name    
	, total_sales			= :total_sales        
	, nk_sales				= :nk_sales      
	, nk_contract_rate		= :nk_contract_rate        
	, cp_contract_rate		= :cp_contract_rate        
	, contract_st_date		= :contract_st_date        
	, contract_ed_date		= :contract_ed_date   
	, cp_corp_user_email	= :cp_corp_user_email      
	, extend_condition		= :extend_condition        
	, use_yn				= :use_yn   
	, output_order			= :output_order
	, update_user_no		= :oper_user_no            
	, update_date			= current_timestamp 
where cp_corp_detail_no = :cp_corp_detail_no
;


-- [Delete]
update cp_corp_detail set
	  use_yn		= 'N'     
	, del_yn		= 'Y'         
	, delete_user_no	= :oper_user_no     
	, delete_date		= current_timestamp 
where cp_corp_detail_no = :cp_corp_detail_no
;