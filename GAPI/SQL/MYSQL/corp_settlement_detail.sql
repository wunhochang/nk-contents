-- [GetList]
select
	  corp_settlement_detail_no
	, settlement_type_no
	, movie_no
	, settlement_summary_no
	, corp_settlement_date
	, confirm_yn
	, col_01
	, col_02
	, col_03
	, col_04
	, col_05
	, col_06
	, col_07
	, col_08
	, col_09
	, col_10
	, col_11
	, col_12
	, col_13
	, col_14
	, col_15
	, col_16
	, col_17
	, col_18
	, col_19
	, col_20
	, col_21
	, col_22
	, col_23
	, col_24
	, col_25
	, col_26
	, col_27
	, col_28
	, col_29
	, col_30
	, use_yn
	, del_yn
	, output_order
	, movie_check
	, movie_tag_name
	, tag_flag
	, insert_date
	, insert_user_no
	, update_date
	, update_user_no
	, delete_date
	, delete_user_no
from corp_settlement_detail
where 1=1 and del_yn = 'N'
	and settlement_type_no = :settlement_type_no
order by output_order asc
;

-- [Insert]
insert into corp_settlement_detail(
	  corp_settlement_detail_no
	, settlement_type_no
	, movie_no
	, settlement_summary_no
	, corp_settlement_date
	, confirm_yn
	, col_01
	, col_02
	, col_03
	, col_04
	, col_05
	, col_06
	, col_07
	, col_08
	, col_09
	, col_10
	, col_11
	, col_12
	, col_13
	, col_14
	, col_15
	, col_16
	, col_17
	, col_18
	, col_19
	, col_20
	, col_21
	, col_22
	, col_23
	, col_24
	, col_25
	, col_26
	, col_27
	, col_28
	, col_29
	, col_30
	, output_order
	, movie_check
	, movie_tag_name
	, tag_flag
	, insert_date
	, insert_user_no
	, update_date
	, update_user_no
)
values(
	  :corp_settlement_detail_no   
	, :settlement_type_no          
	, :movie_no                    
	, :settlement_summary_no       
	, :corp_settlement_date        
	, :confirm_yn                  
	, :col_01                      
	, :col_02                      
	, :col_03                      
	, :col_04                      
	, :col_05                      
	, :col_06                      
	, :col_07                      
	, :col_08                      
	, :col_09                      
	, :col_10                      
	, :col_11                      
	, :col_12                      
	, :col_13                      
	, :col_14                      
	, :col_15                      
	, :col_16                      
	, :col_17                      
	, :col_18                      
	, :col_19                      
	, :col_20                      
	, :col_21                      
	, :col_22                      
	, :col_23                      
	, :col_24                      
	, :col_25                      
	, :col_26                      
	, :col_27                      
	, :col_28                      
	, :col_29                      
	, :col_30 
	, :output_order
	, :movie_check
	, :movie_tag_name
	, :tag_flag
	, current_timestamp
	, :oper_user_no
	, current_timestamp
	, :oper_user_no
);

-- [Update]
update corp_settlement_detail set
	  settlement_type_no	= :settlement_type_no      
	, movie_no				= :movie_no                
	, settlement_summary_no	= :settlement_summary_no   
	, corp_settlement_date	= :corp_settlement_date    
	, confirm_yn			= :confirm_yn              
	, col_01				= :col_01                  
	, col_02				= :col_02                  
	, col_03				= :col_03                  
	, col_04				= :col_04                  
	, col_05				= :col_05                  
	, col_06				= :col_06                  
	, col_07				= :col_07                  
	, col_08				= :col_08                  
	, col_09				= :col_09                  
	, col_10				= :col_10                  
	, col_11				= :col_11                  
	, col_12				= :col_12                  
	, col_13				= :col_13                  
	, col_14				= :col_14                  
	, col_15				= :col_15                  
	, col_16				= :col_16                  
	, col_17				= :col_17                  
	, col_18				= :col_18                  
	, col_19				= :col_19                  
	, col_20				= :col_20                  
	, col_21				= :col_21                  
	, col_22				= :col_22                  
	, col_23				= :col_23                  
	, col_24				= :col_24                  
	, col_25				= :col_25                  
	, col_26				= :col_26                  
	, col_27				= :col_27                  
	, col_28				= :col_28                  
	, col_29				= :col_29                  
	, col_30				= :col_30                  
	, output_order			= :output_order    
	, movie_check			= :movie_check
	, movie_tag_name		= :movie_tag_name
	, tag_flag				= :tag_flag
	, update_date			= current_timestamp        
	, update_user_no		= :oper_user_no            

where corp_settlement_detail_no = :corp_settlement_detail_no
;

-- [Delete]
update corp_settlement_detail set
	  use_yn		= 'N'     
	, del_yn		= 'Y'         
	, delete_user_no	= :oper_user_no     
	, delete_date		= current_timestamp 
where corp_settlement_detail_no = :corp_settlement_detail_no
;