package com.example.inventory.repository;

import com.example.inventory.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findAllByOrderByStatusAscReservedDateDesc();

    /**
     * Check if an item exists with the given tombamento
     * 
     * @param tombamento the tombamento value to check
     * @return true if an item with this tombamento exists, false otherwise
     */
    boolean existsByTombamento(String tombamento);

    /**
     * Find items by a list of tombamentos
     * 
     * @param tombamentos list of tombamento values
     * @return list of items
     */
    @Query("SELECT i FROM Item i WHERE i.tombamento IN :tombamentos")
    List<Item> findAllByTombamentoIn(@Param("tombamentos") List<String> tombamentos);
}
