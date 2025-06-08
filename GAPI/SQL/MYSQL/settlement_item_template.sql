-- [GetList]
select
    a.common_code_no
  , a.type_name
  , a.type_code
  , a.type_data
  , ifnull(b.settlement_item_template_no, 0) as settlement_item_template_no
  , a.output_order
  , b.settlement_type_no
  , b.col_no
  , b.col_title
  , (case when b.movie_name_yn = 'Y' then true else false end) as movie_name_yn
  , (case when b.cal_yn = 'Y' then true else false end) as cal_yn
  , (case when b.display_yn = 'Y' then true else false end) as display_yn
  , (case when b.dis_rate_yn = 'Y' then true else false end) as dis_rate_yn
  , (case when b.discount_yn = 'Y' then true else false end) as discount_yn
  , (case when b.count_yn = 'Y' then true else false end) as count_yn
  , (case when b.cancel_count_yn = 'Y' then true else false end) as cancel_count_yn
  , (case when b.sale_price_yn = 'Y' then true else false end) as sale_price_yn
  , (case when b.tot_price_yn = 'Y' then true else false end) as tot_price_yn
  , ifnull(col_align,'left') as col_align
  , ifnull(col_width,'120') as col_width
  , ifnull(col_value_type,'string') as col_value_type
  , b.expression
  , b.insert_date
  , b.insert_user_no
  , b.update_date
  , b.update_user_no
  , b.delete_date
  , b.delete_user_no
from common_code a 
left join settlement_item_template b 
on a.type_code = b.col_no 
  and b.settlement_type_no = ifnull(:settlement_type_no,0)
where a.type_name = 'SETTLEMENT_COL_GROUP' 
  and a.use_yn = 'Y' 
  and a.del_yn = 'N'
order by a.output_order asc
;

-- [GetDetailList]
select
	  settlement_item_template_no
	, settlement_type_no
	, col_no
	, col_title
	, movie_name_yn
	, cal_yn
	, display_yn
	, dis_rate_yn
	, discount_yn
	, count_yn
	, cancel_count_yn
	, sale_price_yn
	, tot_price_yn
	, ifnull(col_align, 'center') as col_align
	, ifnull(col_width, '120') as col_width
	, ifnull(col_value_type, 'string') as col_value_type
	, expression
	, output_order
from settlement_item_template
where settlement_type_no = :settlement_type_no
order by output_order asc;

-- [Insert]
insert into settlement_item_template(
	  settlement_item_template_no
	, settlement_type_no
	, col_no
	, col_title
	, movie_name_yn
	, cal_yn
	, display_yn
	, dis_rate_yn
	, discount_yn
	, count_yn
	, cancel_count_yn
	, sale_price_yn
	, tot_price_yn
	, col_align
	, col_width
	, col_value_type
	, expression
	, output_order
	, insert_date
	, insert_user_no
	, update_date
	, update_user_no
)
values(
	  :settlement_item_template_no
	, :settlement_type_no
	, :col_no
	, :col_title
	, :movie_name_yn
	, :cal_yn
	, :display_yn
	, :dis_rate_yn
	, :discount_yn
	, :count_yn
	, :cancel_count_yn
	, :sale_price_yn
	, :tot_price_yn
	, :col_align
	, :col_width
	, :col_value_type
	, :expression
	, :output_order
	, current_timestamp
	, :oper_user_no
	, current_timestamp
	, :oper_user_no
);

-- [Update]
update settlement_item_template set
	  settlement_type_no= :settlement_type_no       
	, col_no	    = :col_no                   
	, col_title	    = :col_title                
	, movie_name_yn	= :movie_name_yn            
	, cal_yn	    = :cal_yn                   
	, display_yn	= :display_yn  
	, dis_rate_yn	= :dis_rate_yn
	, discount_yn	= :discount_yn
	, count_yn		= :count_yn
	, cancel_count_yn = :cancel_count_yn
	, sale_price_yn	  = :sale_price_yn
	, tot_price_yn	= :tot_price_yn
	, col_align		= :col_align
	, col_width		= :col_width
	, col_value_type= :col_value_type
	, expression	= :expression
	, output_order	= :output_order               
	, update_date	= :oper_user_no             
	, update_user_no= current_timestamp 
where settlement_item_template_no = :settlement_item_template_no
;

-- [Delete]
delete from settlement_item_template
where settlement_type_no = :settlement_type_no
;
/*
update settlement_item_template set
	  use_yn		= 'N'     
	, del_yn		= 'Y'         
	, delete_user_no	= :oper_user_no     
	, delete_date		= current_timestamp 
where settlement_item_template_no = :settlement_item_template_no
;
*/