package com.example.inventory.bootstrap;

import com.example.inventory.model.Item;
import com.example.inventory.model.ItemState;
import com.example.inventory.model.ItemStatus;
import com.example.inventory.repository.ItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class DataLoader implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataLoader.class);

    private final ItemRepository itemRepository;

    public DataLoader(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (itemRepository.count() == 0) {
            loadItems();
        }
    }

    private void loadItems() {
        Item item1 = new Item("Dell XPS 15", "High-performance laptop for development team", "012345",  ItemStatus.ON_ROOM,
                LocalDate.now().minusDays(15));
        Item item2 = new Item("Ergonomic Chair", "Office chair with lumbar support", "012346", ItemStatus.ON_ROOM, null);
        Item item3 = new Item("Projector", "Conference room 1080p projector", "012347", ItemStatus.ON_ROOM,
                LocalDate.now().minusDays(5));
        Item item4 = new Item("Coffee Machine", "Espresso machine for break room", "012348", ItemStatus.ON_ROOM, null);
        Item item5 = new Item("Mechanical Keyboard", "Keychron K2 wireless keyboard","01235", ItemStatus.ON_ROOM, null);
        Item item6 = new Item("27-inch Monitor", "4K Ultra HD Monitor", "01236", ItemStatus.ON_ROOM,
                LocalDate.now().minusDays(2));

        itemRepository.saveAll(List.of(item1, item2, item3, item4, item5, item6));

        item3.setState(ItemState.BROKEN);
        itemRepository.save(item3);
        log.info("Loaded mock inventory items.");
    }
}
